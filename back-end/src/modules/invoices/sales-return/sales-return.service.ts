import { AppDataSource } from '../../../data-source';
import { type ApiResponse, ApiStatus } from '../../../responses';
import { cache, parseError } from '../../../helpers';
import logger from '../../../logger';

import { SalesReturn } from './sales-return.entity';
import { Inventory } from '../../inventory/inventory.entity';
import { InvoiceTypes } from '../invoice-type.enum';

import * as InventoryService from '../../inventory/inventory.service';
import * as SerialNumberHelper from '../../../helpers/serial-number.helper';
import { SalesReturnSchema } from './sales-return.schema';
import { SalesReturnItem } from './sales-return-item.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';
import { getFiltering, getPagination, getSorting } from '../../../helpers/get-all-query.helper';
import { isEmpty } from '../../../helpers/utility.helper';

const salesReturnRepository = AppDataSource.getRepository(SalesReturn);

export async function getAllReturns(companyId: string, yearId: string, query: GetAllQuery): Promise<ApiResponse<SalesReturn[]>> {
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

  const [invoices, total] = await salesReturnRepository.findAndCount({
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

  return { success: true, message: 'Serving sales returns from database', data: invoices, total: total, status: ApiStatus.OK };
}

export async function getReturnById(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<SalesReturn>> {
  const data = await cache.get<SalesReturn>(`sales_return_${companyId}_${yearId}:${invoiceId}`);
  if (data) {
    return { success: true, message: 'Serving a sales return from cache', data, status: ApiStatus.OK };
  }
  const invoice = await salesReturnRepository.findOne({
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

export async function createReturn(companyId: string, yearId: string, invoice: SalesReturn, userId: string): Promise<ApiResponse<SalesReturn>> {
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

    for (const lineItem of savedInvoice.lineItems || []) {
      const inventory = queryRunner.manager.create(Inventory, {
        companyId: companyId,
        invoiceId: savedInvoice.invoiceId,
        lineItemId: lineItem.lineItemId,
        invoiceType: InvoiceTypes.SalesReturn,
        productId: lineItem.productId,
        unitId: lineItem.unitId,
        description: lineItem.description,
        buyingPrice: lineItem.rate
      });

      inventory.gtn = lineItem.gtn;
      inventory.qtyOnHand = lineItem.qty;
      await InventoryService.saveInventory(queryRunner, inventory);
    }

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId);
    return { success: true, message: 'Sales Return created successfully', data: savedInvoice, status: ApiStatus.CREATED };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message);
    }
    return { success: false, message: 'Failed to create sales return', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

export async function deleteReturn(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<SalesReturn>> {
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
    // delete invoice
    await queryRunner.manager.delete(SalesReturn, { invoiceId });

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId, invoiceId);
    return { success: true, message: 'Sales Return deleted successfully', data: invoice, status: ApiStatus.OK };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message, error.stack);
    }
    return { success: false, message: 'Failed to delete sales return', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

async function invalidateCache(companyId: string, yearId: string, invoiceId?: string): Promise<void> {
  await cache.del(`sales_return_${companyId}_${yearId}`);
  if (invoiceId) {
    await cache.del(`sales_return_${companyId}_${yearId}:${invoiceId}`);
  }
}
