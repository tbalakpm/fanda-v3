import { AppDataSource } from '../../data-source';
import { cache } from '../../helpers';
import { SerialNumberHelper } from '../../helpers/serial-number.helper';
import { ApiResponse, ApiStatus } from '../../responses';
import { Inventory } from '../inventory/inventory.entity';
import { StockInvoice } from './stock-invoice.entity';
import { InvoiceTypes } from '../shared/invoice-type.enum';
import { InventoryService } from '../inventory/inventory.service';
import { StockLineItem } from './stock-line-item.entity';

export class StockInvoiceService {
  private static readonly stockInvoiceRepository = AppDataSource.getRepository(StockInvoice);

  static async getAllStockInvoices(companyId: string, yearId: string): Promise<ApiResponse<StockInvoice[]>> {
    const data = await cache.get<StockInvoice[]>(`stockInvoices_${companyId}_${yearId}`);
    if (data) {
      return { success: true, message: 'Serving stock invoices from cache', data, status: ApiStatus.OK };
    }
    const invoices = await this.stockInvoiceRepository.find({
      select: ['invoiceId', 'invoiceNumber', 'invoiceDate', 'totalQty', 'totalAmount', 'notes', 'yearId'],
      where: { companyId, yearId },
      order: { yearId: 'ASC', invoiceId: 'ASC' }
    });
    await cache.set(`stockInvoices_${companyId}_${yearId}`, invoices);
    return { success: true, message: 'Serving stock invoices from database', data: invoices, status: ApiStatus.OK };
  }

  static async getStockInvoiceById(companyId: string, yearId: string, invoiceId: string): Promise<ApiResponse<StockInvoice>> {
    const data = await cache.get<StockInvoice>(`stockInvoices_${companyId}_${yearId}:${invoiceId}`);
    if (data) {
      return { success: true, message: 'Serving a stock invoice from cache', data, status: ApiStatus.OK };
    }
    const invoice = await this.stockInvoiceRepository.findOne({
      select: ['invoiceId', 'invoiceNumber', 'invoiceDate', /*'lineItems',*/ 'totalQty', 'totalAmount', 'notes', 'yearId'],
      // relations: ['lineItems'],
      where: { companyId, yearId, invoiceId }
    });
    if (!invoice) {
      return { success: false, message: `Stock Invoice with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    const lineItems = await AppDataSource.getRepository(StockLineItem).findBy({ invoiceId });
    invoice.lineItems = lineItems;

    await cache.set(`stockInvoices_${companyId}_${yearId}:${invoiceId}`, invoice);
    return { success: true, message: 'Serving stock invoice from database', data: invoice, status: ApiStatus.OK };
  }

  static async createStockInvoice(companyId: string, yearId: string, invoice: StockInvoice, userId: string): Promise<ApiResponse<StockInvoice>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // create invoice
      const createdInvoice = queryRunner.manager.create(StockInvoice, invoice);
      createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, yearId, InvoiceTypes.Stock);
      createdInvoice.companyId = companyId;
      createdInvoice.yearId = yearId;
      createdInvoice.user = { created: userId, updated: userId };

      let totalQty = 0;
      let totalAmount = 0;
      const serials = [];

      for (const lineItem of createdInvoice.lineItems || []) {
        let beginSerial: string = '';
        let endSerial: string = '';
        let serial = null;

        // calculations - start
        lineItem.qty = Number(lineItem.qty);
        lineItem.rate = Number(lineItem.rate);
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
        lineItem.sellingPrice = Number(lineItem.rate + lineItem.marginAmt);
        totalQty += lineItem.qty;
        totalAmount += lineItem.lineTotal;
        // calculations - end

        if (!lineItem.gtn) {
          lineItem.gtn = '';
        } else if (lineItem.gtn.toLowerCase() === 'tbd') {
          const result = await SerialNumberHelper.getNextRangeSerial(queryRunner, yearId, 'GTN', lineItem.qty);
          beginSerial = result.beginSerial;
          endSerial = result.endSerial;
          serial = { current: result.serial.current || 0, length: result.serial.length || 0, prefix: result.serial.prefix || '' };
          lineItem.gtn = beginSerial === endSerial ? beginSerial : `${beginSerial}-${endSerial}`;
        }
        serials.push(serial);
      }

      createdInvoice.totalQty = totalQty;
      createdInvoice.totalAmount = totalAmount;
      const savedInvoice = await queryRunner.manager.save(createdInvoice);

      //const inventories: Inventory[] = [];
      let index = 0;
      for (const lineItem of savedInvoice.lineItems || []) {
        const serial = serials[index++];

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
          expiryDate: lineItem.expiryDate
        });

        if (!serial) {
          inventory.gtn = lineItem.gtn;
          inventory.qtyOnHand = lineItem.qty;
          await InventoryService.saveInventory(queryRunner, inventory);
        } else {
          for (let i = 0; i < lineItem.qty; i++) {
            inventory.gtn = SerialNumberHelper.formatSerial(serial.length || 0, (serial.current || 1) + i, serial.prefix || '');
            inventory.qtyOnHand = 1;
            await InventoryService.saveInventory(queryRunner, inventory);
          }
        }
      }

      await queryRunner.commitTransaction();
      await cache.del(`stockInvoices_${companyId}_${yearId}`);
      return { success: true, message: 'Stock Invoice created successfully', data: savedInvoice, status: ApiStatus.CREATED };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (process.env.NODE_ENV === 'development') {
        console.log(error);
      }
      return { success: false, message: 'Failed to create Stock Invoice', status: ApiStatus.INTERNAL_SERVER_ERROR };
    } finally {
      await queryRunner.release();
    }
  }
}
