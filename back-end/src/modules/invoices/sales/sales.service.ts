import { AppDataSource } from '../../../data-source';
import { type ApiResponse, ApiStatus } from '../../../responses';
import { cache, parseError } from '../../../helpers';

import { Sales } from './sales.entity';
import { InvoiceTypes } from '../invoice-type.enum';

import * as InventoryService from '../../inventory/inventory.service';
import * as SerialNumberHelper from '../../../helpers/serial-number.helper';
import logger from '../../../logger';
import { SalesSchema } from './sales.schema';
import { SalesLineItem } from './sales-line-item.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';
import { getFiltering, getPagination, getSorting } from '../../../helpers/get-all-query.helper';
import { isEmpty } from '../../../helpers/utility.helper';

const SalesRepository = AppDataSource.getRepository(Sales);

export async function getAllSales(companyId: string, yearId: string, query: GetAllQuery): Promise<ApiResponse<Sales[]>> {
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

  const [invoices, total] = await SalesRepository.findAndCount({
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
      additionalCharges: true,
      netAmount: true,
      notes: true,
      lineItems: false
    },
    relations: ['customer'],
    where: where, // { companyId, yearId },
    order: order, // { companyId: 'ASC', yearId: 'ASC', invoiceId: 'ASC' },
    skip: pagination.offset, // ((query.page || 1) - 1) * (query.size || 10),
    take: pagination.limit
  });

  return { success: true, message: 'Serving sales from database', data: invoices, total, status: ApiStatus.OK };
}

export async function getSalesById(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<Sales>> {
  const data = await cache.get<Sales>(`sales_${companyId}_${yearId}:${invoiceId}`);
  if (data) {
    return { success: true, message: 'Serving a sales from cache', data, status: ApiStatus.OK };
  }
  const invoice = await SalesRepository.findOne({
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
      additionalCharges: true,
      netAmount: true,
      notes: true,
      lineItems: false
    },
    relations: ['customer'],
    relationLoadStrategy: 'query',
    where: { invoiceId }
  });
  if (!invoice) {
    return { success: false, message: `Sales with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  const lineItems = await AppDataSource.getRepository(SalesLineItem).findBy({ invoiceId });
  invoice.lineItems = lineItems;

  await cache.set(`sales_${companyId}_${yearId}:${invoiceId}`, invoice);
  return { success: true, message: 'Serving a sales from database', data: invoice, status: ApiStatus.OK };
}

export async function createSales(companyId: string, yearId: string, invoice: Sales, userId: string): Promise<ApiResponse<Sales>> {
  const parsedResult = SalesSchema.safeParse(invoice);
  if (!parsedResult.success) {
    return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
  }

  const parsedInvoice = parsedResult.data as Sales;
  parsedInvoice.companyId = companyId;
  parsedInvoice.yearId = yearId;
  parsedInvoice.user = { created: userId, updated: userId };

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    // create invoice
    const createdInvoice = queryRunner.manager.create(Sales, parsedInvoice);
    createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, yearId, InvoiceTypes.Sales);

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
    createdInvoice.netAmount = subtotal - createdInvoice.discountAmt + totalTaxAmt + invoice.additionalCharges;
    const savedInvoice = await queryRunner.manager.save(createdInvoice);

    //let index = 0;
    for (const lineItem of savedInvoice.lineItems || []) {
      if (lineItem.gtn?.includes('~')) {
        await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, savedInvoice.invoiceId, lineItem.lineItemId, -1);
      } else {
        await InventoryService.updateQtyOnHandByInvoice(queryRunner, companyId, savedInvoice.invoiceId, lineItem.lineItemId, -lineItem.qty);
      }
    }

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId);
    return { success: true, message: 'Sales created successfully', data: savedInvoice, status: ApiStatus.CREATED };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message);
    }
    return { success: false, message: 'Failed to create Sales', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

export async function deleteSales(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<Sales>> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const invoice = await queryRunner.manager.findOne(Sales, { where: { invoiceId } });
    if (!invoice) {
      return { success: false, message: `Sales with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    const lineItems = await queryRunner.manager.findBy(SalesLineItem, { invoiceId });
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

    await queryRunner.manager.delete(Sales, { invoiceId });

    await queryRunner.commitTransaction();
    await invalidateCache(companyId, yearId, invoiceId);
    return { success: true, message: 'Sales deleted successfully', data: invoice, status: ApiStatus.OK };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.message, error.stack);
    }
    return { success: false, message: 'Failed to delete Sales', status: ApiStatus.INTERNAL_SERVER_ERROR };
  } finally {
    await queryRunner.release();
  }
}

async function invalidateCache(companyId: string, yearId: string, invoiceId?: string): Promise<void> {
  await cache.del(`sales_${companyId}_${yearId}`);
  if (invoiceId) {
    await cache.del(`sales_${companyId}_${yearId}:${invoiceId}`);
  }
}
