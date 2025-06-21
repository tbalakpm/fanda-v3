import { AppDataSource } from '../../../data-source';
import { type ApiResponse, ApiStatus } from '../../../responses';
import { cache, parseError } from '../../../helpers';

import { StockInvoice } from './stock-invoice.entity';
import { Inventory } from '../../inventory/inventory.entity';
import { GtnGeneration } from '../../product/gtn-generation.enum';
import { InvoiceTypes } from '../invoice-type.enum';
import type { ProductSerialDto } from '../product-serial.dto';

import * as InventoryService from '../../inventory/inventory.service';
import * as ProductService from '../../product/product.service';
import * as SerialNumberHelper from '../../../helpers/serial-number.helper';
import logger from '../../../logger';
import { StockInvoiceSchema } from './stock-invoice.schema';
import { StockLineItem } from './stock-line-item.entity';
import { getFiltering, getPagination, getSorting } from '../../../helpers/get-all-query.helper';
import { isEmpty } from '../../../helpers/utility.helper';
import type { GetAllQuery } from '../../../interfaces/get-all-query';

const stockInvoiceRepository = AppDataSource.getRepository(StockInvoice);

export async function getAllStockInvoices(companyId: string, yearId: string, query: GetAllQuery): Promise<ApiResponse<StockInvoice[]>> {
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

  const [invoices, total] = await stockInvoiceRepository.findAndCount({
    select: ['invoiceId', 'invoiceNumber', 'invoiceDate', 'totalQty', 'totalAmount', 'notes'],
    where: where, // { companyId, yearId },
    order: order, // { companyId: 'ASC', yearId: 'ASC', invoiceId: 'ASC' }
    skip: pagination.offset,
    take: pagination.limit
  });

  return { success: true, message: 'Serving stock invoices from database', data: invoices, total, status: ApiStatus.OK };
}

export async function getStockInvoiceById(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<StockInvoice>> {
  const data = await cache.get<StockInvoice>(`stockInvoices_${companyId}_${yearId}:${invoiceId}`);
  if (data) {
    return { success: true, message: 'Serving a stock invoice from cache', data, status: ApiStatus.OK };
  }
  const invoice = await stockInvoiceRepository.findOne({
    select: ['invoiceId', 'invoiceNumber', 'invoiceDate', 'totalQty', 'totalAmount', 'notes'],
    // where: { companyId, yearId, invoiceId }
    where: { invoiceId }
  });

  if (!invoice) {
    return { success: false, message: `Stock Invoice with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  const lineItems = await AppDataSource.getRepository(StockLineItem).findBy({ invoiceId });
  invoice.lineItems = lineItems;

  await cache.set(`stockInvoices_${companyId}_${yearId}:${invoiceId}`, invoice);
  return { success: true, message: 'Serving a stock invoice from database', data: invoice, status: ApiStatus.OK };
}

export async function createStockInvoice(
  companyId: string,
  yearId: string,
  invoice: StockInvoice,
  userId: string
): Promise<ApiResponse<StockInvoice>> {
  const parsedResult = StockInvoiceSchema.safeParse(invoice);
  if (!parsedResult.success) {
    return {
      success: false,
      message: parseError(parsedResult),
      status: ApiStatus.BAD_REQUEST
    };
  }

  const parsedInvoice = parsedResult.data as StockInvoice;
  parsedInvoice.companyId = companyId;
  parsedInvoice.yearId = yearId;
  parsedInvoice.user = { created: userId, updated: userId };

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    // create invoice
    const createdInvoice = queryRunner.manager.create(StockInvoice, parsedInvoice);
    createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, yearId, InvoiceTypes.Stock);

    let totalQty = 0;
    let totalAmount = 0;
    const productSerials: ProductSerialDto[] = [];

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
      lineItem.marginPct = lineItem.marginPct || 0;
      if (lineItem.marginPct > 0) {
        lineItem.marginAmt = Number(Math.round((lineItem.rate * (lineItem.marginPct / 100.0) * 100.0) / 100.0).toFixed(2));
      } else {
        lineItem.marginAmt = lineItem.marginAmt || 0;
      }
      lineItem.sellingPrice = lineItem.rate + lineItem.marginAmt;
      totalQty += lineItem.qty;
      totalAmount += lineItem.lineTotal;
      // calculations - end

      const productSerial: ProductSerialDto = {};

      const productResponse = await ProductService.getProductById(companyId, lineItem.productId, queryRunner);
      if (productResponse.success && productResponse.data) {
        const product = productResponse.data;

        productSerial.product = {
          productId: lineItem.productId,
          isPriceInclusiveTax: product.isPriceInclusiveTax,
          gtnGeneration: product.gtnGeneration
        };

        // GTN generation
        if (!lineItem.gtn || lineItem.gtn.trim().length === 0 || lineItem.gtn.trim().toLocaleLowerCase() === 'tbd') {
          switch (product.gtnGeneration) {
            case GtnGeneration.Batch: {
              const result = await SerialNumberHelper.getNextSerial(queryRunner, yearId, 'gtn');
              lineItem.gtn = result;
              break;
            }
            case GtnGeneration.Tag: {
              const result = await SerialNumberHelper.getNextRangeSerial(queryRunner, yearId, 'gtn', lineItem.qty);
              productSerial.serial = { length: result.serial.length, current: result.serial.current, prefix: result.serial.prefix };
              lineItem.gtn = result.beginSerial === result.endSerial ? result.beginSerial : `${result.beginSerial}~${result.endSerial}`;
              break;
            }
            case GtnGeneration.Code:
              lineItem.gtn = product.code;
              break;
            default:
              logger.error('Invalid GTN generation', product.gtnGeneration);
          }
        }
      } else {
        logger.error('Product not found');
      }

      productSerials.push(productSerial);
    }

    createdInvoice.totalQty = totalQty;
    createdInvoice.totalAmount = totalAmount;
    const savedInvoice = await queryRunner.manager.save(createdInvoice);

    let index = 0;
    for (const lineItem of savedInvoice.lineItems || []) {
      const productSerial = productSerials[index++];

      const inventory = queryRunner.manager.create(Inventory, {
        companyId: companyId,
        invoiceId: savedInvoice.invoiceId,
        lineItemId: lineItem.lineItemId,
        invoiceType: InvoiceTypes.Stock,
        productId: lineItem.productId,
        unitId: lineItem.unitId,
        description: lineItem.description,
        buyingPrice: lineItem.rate,
        marginPct: lineItem.marginPct,
        marginAmt: lineItem.marginAmt,
        sellingPrice: lineItem.sellingPrice,
        mfdDate: lineItem.mfdDate,
        expiryDate: lineItem.expiryDate,
        gtnGeneration: productSerial.product?.gtnGeneration,
        isPriceInclusiveTax: productSerial.product?.isPriceInclusiveTax
      });

      if (!productSerial.serial) {
        inventory.gtn = lineItem.gtn;
        inventory.qtyOnHand = lineItem.qty;
        await InventoryService.saveInventory(queryRunner, inventory);
      } else {
        for (let i = 0; i < lineItem.qty; i++) {
          inventory.gtn = SerialNumberHelper.formatSerial(
            productSerial.serial.length || 7,
            (productSerial.serial.current || 1) + i,
            productSerial.serial.prefix || ''
          );
          inventory.qtyOnHand = 1;
          await InventoryService.saveInventory(queryRunner, inventory);
        }
      }
    }

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId);
    return { success: true, message: 'Stock Invoice created successfully', data: savedInvoice, status: ApiStatus.CREATED };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message);
    }
    return { success: false, message: 'Failed to create stock invoice', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

export async function deleteStockInvoice(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<StockInvoice>> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const invoice = await queryRunner.manager.findOne(StockInvoice, { where: { invoiceId } });
    if (!invoice) {
      return { success: false, message: `Stock Invoice with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    const lineItems = await queryRunner.manager.findBy(StockLineItem, { invoiceId });
    invoice.lineItems = lineItems;

    if (invoice.lineItems) {
      for (const lineItem of invoice.lineItems) {
        // GTN Rage generated by TAG generation option for bulk quantity
        if (lineItem.gtn?.includes('~')) {
          await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, invoiceId, lineItem.lineItemId, -1);
        } else {
          await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, invoiceId, lineItem.lineItemId, -lineItem.qty);
        }
      }
    }
    await queryRunner.manager.delete(StockInvoice, { invoiceId });

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId, invoiceId);
    return { success: true, message: 'Stock invoice deleted successfully', data: invoice, status: ApiStatus.OK };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message, error.stack);
    }
    return { success: false, message: 'Failed to delete stock invoice', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

async function invalidateCache(companyId: string, yearId: string, invoiceId?: string): Promise<void> {
  await cache.del(`stockInvoices_${companyId}_${yearId}`);
  if (invoiceId) {
    await cache.del(`stockInvoices_${companyId}_${yearId}:${invoiceId}`);
  }
}
