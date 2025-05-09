import { AppDataSource } from '../../../data-source';
import { ApiResponse, ApiStatus } from '../../../responses';
import { cache, parseError } from '../../../helpers';
import logger from '../../../logger';

import { SalesReturn } from './sales-return.entity';
import { Inventory } from '../../inventory/inventory.entity';
import { InvoiceTypes } from '../invoice-type.enum';

import { InventoryService } from '../../inventory/inventory.service';
import { SerialNumberHelper } from '../../../helpers/serial-number.helper';
import { SalesReturnSchema } from './sales-return.schema';
import { SalesReturnItem } from './sales-return-item.entity';
import { GetAllQuery } from '../../../interfaces/get-all-query';
import { getFiltering, getPagination, getSorting } from '../../../helpers/get-all-query.helper';
import { isEmpty } from '../../../helpers/utility.helper';

class SalesReturnService {
  private readonly salesReturnRepository = AppDataSource.getRepository(SalesReturn);

  async getAllReturns(companyId: string, yearId: string, query: GetAllQuery): Promise<ApiResponse<SalesReturn[]>> {
    // const data = await cache.get<Purchase[]>(`purchases_${companyId}_${yearId}`);
    // if (data) {
    //   return { success: true, message: 'Serving purchases from cache', data, status: ApiStatus.OK };
    // }

    const pagination = getPagination(query);
    const where = getFiltering(query.filter);
    // mandatory where clauses
    where.companyId = companyId;
    where.yearId = yearId;
    const order = getSorting(query.sort);
    // default order - by id
    if (isEmpty(order)) {
      order.invoiceId = 'desc'; // { invoiceId: 'desc' };
    }

    // console.log('page', pagination, 'where', where, 'order', order);
    // const [languages, total] = await this.cityRepository.findAndCount({
    //   where,
    //   order,
    //   take: limit,
    //   skip: offset
    // });

    // return {
    //   totalItems: total,
    //   items: languages,
    //   page,
    //   size
    // };

    const [invoices, total] = await this.salesReturnRepository.findAndCount({
      select: {
        invoiceId: true,
        invoiceNumber: true,
        invoiceDate: true,
        refDate: true,
        refNumber: true,
        customerId: true,
        customer: {
          customerId: true,
          code: true,
          name: true
        },
        totalQty: true,
        subtotal: true,
        discountPct: true,
        discountAmt: true,
        totalTaxAmt: true,
        netAmount: true,
        notes: true,
        companyId: true,
        yearId: true,
        lineItems: false
      },
      relations: ['customer'],
      // where: { companyId, yearId },
      where,
      // order: { companyId: 'ASC', yearId: 'ASC', invoiceId: 'ASC' },
      order,
      skip: pagination.offset, // ((query.page || 1) - 1) * (query.limit || 10),
      take: pagination.limit // query.limit
    });

    // await cache.set(`purchases_${companyId}_${yearId}`, invoices);
    return { success: true, message: 'Serving sales returns from database', data: invoices, total: total, status: ApiStatus.OK };
  }

  async getReturnById(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<SalesReturn>> {
    const data = await cache.get<SalesReturn>(`sales_return_${companyId}_${yearId}:${invoiceId}`);
    if (data) {
      return { success: true, message: 'Serving a sales return from cache', data, status: ApiStatus.OK };
    }
    const invoice = await this.salesReturnRepository.findOne({
      select: {
        invoiceId: true,
        invoiceNumber: true,
        invoiceDate: true,
        refDate: true,
        refNumber: true,
        customerId: true,
        customer: {
          customerId: true,
          code: true,
          name: true
        },
        totalQty: true,
        subtotal: true,
        discountPct: true,
        discountAmt: true,
        totalTaxAmt: true,
        netAmount: true,
        notes: true,
        lineItems: false
      },
      relations: ['customer'],
      relationLoadStrategy: 'query',
      where: { invoiceId }
    });
    if (!invoice) {
      return { success: false, message: `Sales Return with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    const lineItems = await AppDataSource.getRepository(SalesReturnItem).findBy({ invoiceId });
    invoice.lineItems = lineItems;

    await cache.set(`sales_return_${companyId}_${yearId}:${invoiceId}`, invoice);
    return { success: true, message: 'Serving a sales return from database', data: invoice, status: ApiStatus.OK };
  }

  async createReturn(companyId: string, yearId: string, invoice: SalesReturn, userId: string): Promise<ApiResponse<SalesReturn>> {
    const parsedResult = SalesReturnSchema.safeParse(invoice);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }

    const parsedInvoice = parsedResult.data as SalesReturn;
    parsedInvoice.companyId = companyId;
    parsedInvoice.yearId = yearId;
    parsedInvoice.user = { created: userId, updated: userId };

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // create invoice
      const createdInvoice = queryRunner.manager.create(SalesReturn, parsedInvoice);
      createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, yearId, InvoiceTypes.SalesReturn);

      let totalQty = 0;
      let subtotal = 0;
      let totalDiscountAmt = 0;
      let totalTaxAmt = 0;
      // const productSerials: ProductSerialDto[] = [];

      for (const lineItem of createdInvoice.lineItems || []) {
        // calculations - start
        lineItem.price = Number(Math.round((lineItem.qty * lineItem.rate * 100.0) / 100.0).toFixed(2));
        // discount
        lineItem.discountPct = lineItem.discountPct || 0;
        if (lineItem.discountPct > 0) {
          lineItem.discountAmt = Number(Math.round((lineItem.price * (lineItem.discountPct / 100.0) * 100.0) / 100.0).toFixed(2));
        } else {
          lineItem.discountAmt = lineItem.discountAmt || 0;
        }
        // tax
        lineItem.taxPct = lineItem.taxPct || 0;
        if (lineItem.taxPct > 0) {
          lineItem.taxAmt = Number(Math.round(((lineItem.price - lineItem.discountAmt) * (lineItem.taxPct / 100.0) * 100.0) / 100.0).toFixed(2));
        } else {
          lineItem.taxAmt = lineItem.taxAmt || 0;
        }
        // line total, margin, selling price
        lineItem.lineTotal = Number(Math.round(((lineItem.price - lineItem.discountAmt + lineItem.taxAmt) * 100.0) / 100.0).toFixed(2));

        // Footer totals
        totalQty += lineItem.qty;
        subtotal += lineItem.lineTotal;
        totalDiscountAmt += lineItem.discountAmt;
        totalTaxAmt += lineItem.taxAmt;
        // calculations - end
      }

      // const productSerial: ProductSerialDto = {};

      // const productResponse = await ProductService.getProductById(companyId, lineItem.productId, queryRunner);
      // if (productResponse.success && productResponse.data) {
      //   const product = productResponse.data;

      //   productSerial.product = {
      //     productId: lineItem.productId,
      //     isPriceInclusiveTax: product.isPriceInclusiveTax,
      //     gtnGeneration: product.gtnGeneration
      //   };

      // GTN generation
      // if (!lineItem.gtn || lineItem.gtn.trim().length === 0 || lineItem.gtn.trim().toLocaleLowerCase() === 'tbd') {
      //   switch (product.gtnGeneration) {
      //     case GtnGeneration.Batch: {
      //       const result = await SerialNumberHelper.getNextSerial(queryRunner, yearId, 'gtn');
      //       lineItem.gtn = result;
      //       break;
      //     }
      //     case GtnGeneration.Tag: {
      //       const result = await SerialNumberHelper.getNextRangeSerial(queryRunner, yearId, 'gtn', lineItem.qty);
      //       productSerial.serial = { length: result.serial.length, current: result.serial.current, prefix: result.serial.prefix };
      //       lineItem.gtn = result.beginSerial === result.endSerial ? result.beginSerial : `${result.beginSerial}~${result.endSerial}`;
      //       break;
      //     }
      //     case GtnGeneration.Code:
      //       lineItem.gtn = product.code;
      //       break;
      //     default:
      //       logger.error('Invalid GTN generation', product.gtnGeneration);
      //   }
      // }
      // } else {
      //   logger.error('Product not found');
      // }

      // productSerials.push(productSerial);
      // }

      createdInvoice.totalQty = totalQty;
      createdInvoice.subtotal = subtotal;
      // Total discount amount
      if (totalDiscountAmt > 0) {
        createdInvoice.discountAmt = totalDiscountAmt;
      } else {
        createdInvoice.discountPct = createdInvoice.discountPct || 0;
        if (createdInvoice.discountPct > 0) {
          createdInvoice.discountAmt = Number(Math.round((subtotal * (createdInvoice.discountPct / 100.0) * 100.0) / 100.0).toFixed(2));
        } else {
          createdInvoice.discountAmt = invoice.discountAmt || 0;
        }
      }
      createdInvoice.totalTaxAmt = totalTaxAmt;
      createdInvoice.netAmount = subtotal - createdInvoice.discountAmt + totalTaxAmt; // + invoice.additionalCharges;
      const savedInvoice = await queryRunner.manager.save(createdInvoice);

      // let index = 0;
      for (const lineItem of savedInvoice.lineItems || []) {
        // const productSerial = productSerials[index++];

        const inventory = queryRunner.manager.create(Inventory, {
          companyId: companyId,
          invoiceId: savedInvoice.invoiceId,
          lineItemId: lineItem.lineItemId,
          invoiceType: InvoiceTypes.SalesReturn,
          // supplierId: createdInvoice.customerId,
          productId: lineItem.productId,
          unitId: lineItem.unitId,
          description: lineItem.description,
          buyingPrice: lineItem.rate
        });

        // if (!productSerial.serial) {
        inventory.gtn = lineItem.gtn;
        inventory.qtyOnHand = lineItem.qty;
        await InventoryService.saveInventory(queryRunner, inventory);
        // await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, savedInvoice.invoiceId, lineItem.lineItemId, -lineItem.qty);
        // } else {
        //   for (let i = 0; i < lineItem.qty; i++) {
        //     inventory.gtn = SerialNumberHelper.formatSerial(
        //       productSerial.serial.length || 7,
        //       (productSerial.serial.current || 1) + i,
        //       productSerial.serial.prefix || ''
        //     );
        //     inventory.qtyOnHand = 1;
        //     await InventoryService.saveInventory(queryRunner, inventory);
        //   }
        // }
      }

      await queryRunner.commitTransaction();
      await this.invalidateCache(companyId, yearId);
      return { success: true, message: 'Sales Return created successfully', data: savedInvoice, status: ApiStatus.CREATED };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      if (process.env.NODE_ENV === 'development') {
        // console.log(error);
        logger.error(error.message);
      }
      return { success: false, message: 'Failed to create sales return', status: ApiStatus.INTERNAL_SERVER_ERROR };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteReturn(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<SalesReturn>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const invoice = await queryRunner.manager.findOne(SalesReturn, { where: { invoiceId } });
      if (!invoice) {
        return { success: false, message: `Sales Return with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
      }
      const lineItems = await queryRunner.manager.findBy(SalesReturnItem, { invoiceId });
      invoice.lineItems = lineItems;

      invoice.lineItems?.forEach(async (lineItem) => {
        // GTN Rage generated by TAG generation option for bulk quantity
        if (lineItem.gtn?.includes('~')) {
          await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, invoiceId, lineItem.lineItemId, -1);
        } else {
          await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, invoiceId, lineItem.lineItemId, -lineItem.qty);
        }
      });
      //await queryRunner.manager.remove(invoice);
      await queryRunner.manager.delete(SalesReturn, { invoiceId });

      await queryRunner.commitTransaction();
      await this.invalidateCache(companyId, yearId, invoiceId);
      return { success: true, message: 'Sales Return deleted successfully', data: invoice, status: ApiStatus.OK };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      if (process.env.NODE_ENV === 'development') {
        // console.log(error);
        logger.error(error.message, error.stack);
      }
      return { success: false, message: 'Failed to delete sales return', status: ApiStatus.INTERNAL_SERVER_ERROR };
    } finally {
      await queryRunner.release();
    }
  }

  async invalidateCache(companyId: string, yearId: string, invoiceId?: string): Promise<void> {
    await cache.del(`sales_return_${companyId}_${yearId}`);
    if (invoiceId) {
      await cache.del(`sales_return_${companyId}_${yearId}:${invoiceId}`);
    }
  }
}

export const ReturnServiceInstance = new SalesReturnService();
