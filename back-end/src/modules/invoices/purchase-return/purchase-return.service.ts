import { AppDataSource } from '../../../data-source';
import { type ApiResponse, ApiStatus } from '../../../responses';
import { cache, parseError } from '../../../helpers';

import { PurchaseReturn } from './purchase-return.entity';
import { InvoiceTypes } from '../invoice-type.enum';

import * as InventoryService from '../../inventory/inventory.service';
import * as SerialNumberHelper from '../../../helpers/serial-number.helper';
import logger from '../../../logger';
import { PurchaseReturnSchema } from './purchase-return.schema';
import { PurchaseReturnItem } from './purchase-return-item.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';
import { getFiltering, getPagination, getSorting } from '../../../helpers/get-all-query.helper';
import { isEmpty } from '../../../helpers/utility.helper';

// class PurchaseReturnService {
const PurchaseReturnRepository = AppDataSource.getRepository(PurchaseReturn);

export async function getAllPurchaseReturns(companyId: string, yearId: string, query: GetAllQuery): Promise<ApiResponse<PurchaseReturn[]>> {
  // const data = await cache.get<PurchaseReturn[]>(`purchase_returns_${companyId}_${yearId}`);
  // if (data) {
  //   return { success: true, message: 'Serving purchase returns from cache', data, status: ApiStatus.OK };
  // }

  const pagination = getPagination(query);
  const where = getFiltering(query.filter);
  // mandatory where clauses
  where.companyId = companyId;
  where.yearId = yearId;
  const order = getSorting(query.sort);
  // default order - by id
  if (isEmpty(order)) {
    order.invoiceId = 'desc'; // = { invoiceId: 'desc' };
  }
  console.log('pagination', pagination);
  console.log('where', where);
  console.log('order', order);

  //const invoices = await PurchaseReturnRepository.find({
  const [invoices, total] = await PurchaseReturnRepository.findAndCount({
    select: {
      invoiceId: true,
      invoiceNumber: true,
      invoiceDate: true,
      refDate: true,
      refNumber: true,
      supplierId: true,
      supplier: {
        supplierId: true,
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
    relations: ['supplier'],
    where: where, // { companyId, yearId },
    order: order, // { companyId: 'ASC', yearId: 'ASC', invoiceId: 'ASC' },
    skip: pagination.offset, // ((query.page || 1) - 1) * (query.size || 10),
    take: pagination.limit
  });

  // await cache.set(`purchase_returns_${companyId}_${yearId}`, invoices);
  return { success: true, message: 'Serving purchase returns from database', data: invoices, total, status: ApiStatus.OK };
}

export async function getPurchaseReturnById(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<PurchaseReturn>> {
  const data = await cache.get<PurchaseReturn>(`purchase_returns_${companyId}_${yearId}:${invoiceId}`);
  if (data) {
    return { success: true, message: 'Serving a purchase return from cache', data, status: ApiStatus.OK };
  }
  const invoice = await PurchaseReturnRepository.findOne({
    select: {
      invoiceId: true,
      invoiceNumber: true,
      invoiceDate: true,
      refDate: true,
      refNumber: true,
      supplierId: true,
      supplier: {
        supplierId: true,
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
    relations: ['supplier'],
    relationLoadStrategy: 'query',
    where: { invoiceId }
  });
  if (!invoice) {
    return { success: false, message: `Purchase Return with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  const lineItems = await AppDataSource.getRepository(PurchaseReturnItem).findBy({ invoiceId });
  invoice.lineItems = lineItems;

  // await cache.set(`purchase_returns_${companyId}_${yearId}:${invoiceId}`, invoice);
  return { success: true, message: 'Serving a purchase returns from database', data: invoice, status: ApiStatus.OK };
}

export async function createPurchaseReturn(
  companyId: string,
  yearId: string,
  invoice: PurchaseReturn,
  userId: string
): Promise<ApiResponse<PurchaseReturn>> {
  const parsedResult = PurchaseReturnSchema.safeParse(invoice);
  if (!parsedResult.success) {
    return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
  }

  const parsedInvoice = parsedResult.data as PurchaseReturn;
  parsedInvoice.companyId = companyId;
  parsedInvoice.yearId = yearId;
  parsedInvoice.user = { created: userId, updated: userId };

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    // create invoice
    const createdInvoice = queryRunner.manager.create(PurchaseReturn, parsedInvoice);
    createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, yearId, InvoiceTypes.PurchaseReturn);

    let totalQty = 0;
    let subtotal = 0;
    let totalDiscountAmt = 0;
    let totalTaxAmt = 0;
    //const productSerials: ProductSerialDto[] = [];

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

    /*
      // product serials
      //const productSerial: ProductSerialDto = {};

      // const productResponse = await ProductService.getProductById(companyId, lineItem.productId, queryRunner);
      // if (productResponse.success && productResponse.data) {
      //const product = productResponse.data;

      // productSerial.product = {
      //   productId: lineItem.productId,
      //   isPriceInclusiveTax: product.isPriceInclusiveTax,
      //   gtnGeneration: product.gtnGeneration
      // };

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
     */
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

    //let index = 0;
    for (const lineItem of savedInvoice.lineItems || []) {
      if (lineItem.gtn?.includes('~')) {
        await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, savedInvoice.invoiceId, lineItem.lineItemId, -1);
      } else {
        await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, savedInvoice.invoiceId, lineItem.lineItemId, -lineItem.qty);
      }
    }
    //const productSerial = productSerials[index++];

    // const inventory = queryRunner.manager.create(Inventory, {
    //   companyId: companyId,
    //   invoiceId: savedInvoice.invoiceId,
    //   lineItemId: lineItem.lineItemId,
    //   invoiceType: InvoiceTypes.PurchaseReturn,
    //   productId: lineItem.productId,
    //   unitId: lineItem.unitId,
    //   description: lineItem.description,
    //   buyingPrice: lineItem.rate
    //   // gtnGeneration: productSerial.product!.gtnGeneration,
    //   // isPriceInclusiveTax: productSerial.product!.isPriceInclusiveTax
    // });

    // if (!productSerial.serial) {
    //   inventory.gtn = lineItem.gtn;
    //   inventory.qtyOnHand = lineItem.qty;
    //   await InventoryService.saveInventory(queryRunner, inventory);
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
    // }

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId);
    return { success: true, message: 'Purchase return created successfully', data: savedInvoice, status: ApiStatus.CREATED };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      // console.log(error);
      logger.error(error.message);
    }
    return { success: false, message: 'Failed to create Purchase return', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

export async function deletePurchaseReturn(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<PurchaseReturn>> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const invoice = await queryRunner.manager.findOne(PurchaseReturn, { where: { invoiceId } });
    if (!invoice) {
      return { success: false, message: `Purchase return with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    const lineItems = await queryRunner.manager.findBy(PurchaseReturnItem, { invoiceId });
    invoice.lineItems = lineItems;

    if (invoice.lineItems) {
      for (const lineItem of invoice.lineItems) {
        // GTN Rage generated by TAG generation option for bulk quantity
        if (lineItem.gtn?.includes('~')) {
          await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, invoiceId, lineItem.lineItemId, +1);
        } else {
          await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, invoiceId, lineItem.lineItemId, +Number(lineItem.qty));
        }
      }
    }

    //await queryRunner.manager.remove(invoice);
    await queryRunner.manager.delete(PurchaseReturn, { invoiceId });

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId, invoiceId);
    return { success: true, message: 'Purchase return deleted successfully', data: invoice, status: ApiStatus.OK };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message, error.stack);
    }
    return { success: false, message: 'Failed to delete Purchase return', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

async function invalidateCache(companyId: string, yearId: string, invoiceId?: string): Promise<void> {
  await cache.del(`purchase_return_${companyId}_${yearId}`);
  if (invoiceId) {
    await cache.del(`purchase_return_${companyId}_${yearId}:${invoiceId}`);
  }
}
// }

// export const PurchaseReturnServiceInstance = new PurchaseReturnService();
