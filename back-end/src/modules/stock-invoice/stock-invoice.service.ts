import { AppDataSource } from '../../data-source';
import { cache } from '../../helpers';
// import { SerialNumberHelper } from '../../helpers/serial-number.helper';
import { ApiResponse, ApiStatus } from '../../responses';
// import { Inventory } from '../inventory/inventory.entity';
import { StockInvoice } from './stock-invoice.entity';
// import { StockLineItem } from './stock-line-item.entity';

export class StockInvoiceService {
  private static readonly stockInvoiceRepository = AppDataSource.getRepository(StockInvoice);

  static async getAllStockInvoices(yearId: string): Promise<ApiResponse<StockInvoice[]>> {
    const data = await cache.get<StockInvoice[]>(`stockInvoices_${yearId}`);
    if (data) {
      return { success: true, message: 'Serving stock invoices from cache', data, status: ApiStatus.OK };
    }
    const invoices = await this.stockInvoiceRepository.find({
      select: ['invoiceId', 'invoiceNumber', 'invoiceDate', 'totalQty', 'totalAmount', 'notes', 'yearId'],
      where: { yearId },
      order: { yearId: 'ASC', invoiceId: 'ASC' }
    });
    await cache.set(`stockInvoices_${yearId}`, invoices);
    return { success: true, message: 'Serving stock invoices from database', data: invoices, status: ApiStatus.OK };
  }

  static async getStockInvoiceById(yearId: string, invoiceId: string): Promise<ApiResponse<StockInvoice>> {
    const data = await cache.get<StockInvoice>(`stockInvoices_${yearId}:${invoiceId}`);
    if (data) {
      return { success: true, message: 'Serving a stock invoice from cache', data, status: ApiStatus.OK };
    }
    const invoice = await this.stockInvoiceRepository.findOne({
      select: ['invoiceId', 'invoiceNumber', 'invoiceDate', 'lineItems', 'totalQty', 'totalAmount', 'notes', 'yearId'],
      relations: ['lineItems'],
      where: { yearId, invoiceId }
    });
    if (!invoice) {
      return { success: false, message: `Stock Invoice with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await cache.set(`stockInvoices_${yearId}:${invoiceId}`, invoice);
    return { success: true, message: 'Serving stock invoice from database', data: invoice, status: ApiStatus.OK };
  }

  // static async createStockInvoice(yearId: string, invoice: StockInvoice): Promise<ApiResponse<StockInvoice>> {
  //   const queryRunner = AppDataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const createdInvoice = queryRunner.manager.create(StockInvoice, invoice);
  //     createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, 'stock', yearId);
  //     createdInvoice.yearId = yearId;
  //     const savedInvoice = await queryRunner.manager.save(createdInvoice);

  //     invoice.lineItems?.forEach(async (lineItem) => {
  //       lineItem.invoiceId = savedInvoice.invoiceId;
  //       const createdLineItem = queryRunner.manager.create(StockLineItem, lineItem);
  //       const savedLineItem = await queryRunner.manager.save(createdLineItem);

  //       const inventory = queryRunner.manager.create(Inventory, {
  //         invoiceId: savedLineItem.invoiceId,
  //         lineItemId: savedLineItem.lineItemId,
  //         productId: lineItem.productId,
  //         qty: lineItem.qty,
  //         amount: lineItem.amount,
  //         date: savedInvoice.date,
  //         user: savedInvoice.user
  //       });
  //     });

  //     await queryRunner.commitTransaction();
  //     await cache.del(`stockInvoices_${yearId}`);
  //     return { success: true, message: 'Stock Invoice created successfully', data: savedInvoice, status: ApiStatus.CREATED };
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (_error) {
  //     await queryRunner.rollbackTransaction();
  //     return { success: false, message: 'Failed to create Stock Invoice', status: ApiStatus.INTERNAL_SERVER_ERROR };
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
