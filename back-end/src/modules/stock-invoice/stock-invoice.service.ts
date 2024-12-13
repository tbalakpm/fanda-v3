import { AppDataSource } from '../../data-source';
import { cache } from '../../helpers';
import { SerialNumberHelper } from '../../helpers/serial-number.helper';
import { ApiResponse, ApiStatus } from '../../responses';
import { Inventory } from '../inventory/inventory.entity';
import { StockInvoice } from './stock-invoice.entity';
import { InvoiceTypes } from '../shared/invoice-type.enum';
import { InventoryService } from '../inventory/inventory.service';

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
      select: ['invoiceId', 'invoiceNumber', 'invoiceDate', 'lineItems', 'totalQty', 'totalAmount', 'notes', 'yearId'],
      relations: ['lineItems'],
      where: { companyId, yearId, invoiceId }
    });
    if (!invoice) {
      return { success: false, message: `Stock Invoice with id '${invoiceId}' not found`, status: ApiStatus.NOT_FOUND };
    }
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
      createdInvoice.invoiceNumber = await SerialNumberHelper.getNextSerial(queryRunner, yearId, 'stock');
      createdInvoice.companyId = companyId;
      createdInvoice.yearId = yearId;
      createdInvoice.user = { created: userId, updated: userId };

      const serials = [];

      for (const lineItem of createdInvoice.lineItems || []) {
        let beginSerial: string = '';
        let endSerial: string = '';
        let serial = null;

        // calculations - start
        lineItem.qty = Number(lineItem.qty);
        lineItem.rate = Number(lineItem.rate);
        lineItem.price = Number(Math.round((lineItem.qty * lineItem.rate * 100) / 100).toFixed(2));
        lineItem.discountPct = lineItem.discountPct || 0;
        if (lineItem.discountPct > 0) {
          lineItem.discountAmt = Number(Math.round((lineItem.price * (lineItem.discountPct / 100) * 100) / 100).toFixed(2));
        } else {
          lineItem.discountAmt = lineItem.discountAmt || 0;
        }

        lineItem.taxPct = lineItem.taxPct || 0;
        if (lineItem.taxPct > 0) {
          lineItem.taxAmt = Number(Math.round((lineItem.price * (lineItem.taxPct / 100) * 100) / 100).toFixed(2));
        } else {
          lineItem.taxAmt = lineItem.taxAmt || 0;
        }

        lineItem.lineTotal = Number(Math.round(((lineItem.price - lineItem.discountAmt + lineItem.taxAmt) * 100) / 100).toFixed(2));
        lineItem.marginPct = lineItem.marginPct || 0;
        if (lineItem.marginPct > 0) {
          lineItem.marginAmt = Number(Math.round((lineItem.price * (lineItem.marginPct / 100) * 100) / 100).toFixed(2));
        } else {
          lineItem.marginAmt = lineItem.marginAmt || 0;
        }
        lineItem.sellingPrice = Number(lineItem.rate + lineItem.marginAmt);
        // calculations - end

        if (!lineItem.gtn) {
          lineItem.gtn = '';
        } else if (lineItem.gtn.toLowerCase() === 'tbd') {
          const result = await SerialNumberHelper.getNextRangeSerial(queryRunner, yearId, 'gtn', lineItem.qty);
          beginSerial = result.beginSerial;
          endSerial = result.endSerial;
          serial = { current: result.serial.current || 0, length: result.serial.length || 0, prefix: result.serial.prefix || '' };
          lineItem.gtn = beginSerial === endSerial ? beginSerial : `${beginSerial}-${endSerial}`;
        }
        serials.push(serial);

        // const newLineItem = {
        //   gtn: lineItem.gtn,
        //   productId: lineItem.productId,
        //   unitId: lineItem.unitId,
        //   description: lineItem.description,
        //   mfdDate: lineItem.mfdDate,
        //   expiryDate: lineItem.expiryDate,
        //   taxCode: lineItem.taxCode,
        //   qty: lineItem.qty,
        //   rate: lineItem.rate,
        //   price: lineItem.qty * lineItem.rate,
        //   discountPct: lineItem.discountPct,
        //   discountAmt: lineItem.discountAmt,
        //   taxPct: lineItem.taxPct,
        //   taxAmt: lineItem.taxAmt,
        //   marginPct: lineItem.marginPct,
        //   marginAmt: lineItem.marginAmt,
        //   sellingPrice: lineItem.sellingPrice,
        //   lineTotal: lineItem.lineTotal,
        //   serial: serial
        // };
        // newLineItems.push(newLineItem);
      }

      const savedInvoice = await queryRunner.manager.save(createdInvoice);

      //const inventories: Inventory[] = [];
      let index = 0;
      for (const lineItem of savedInvoice.lineItems || []) {
        const serial = serials[index++];
        // console.log('SERIAL', serial, 'LINEITEM.GTN', lineItem.gtn);

        for (let i = 0; i < lineItem.qty; i++) {
          const inventory = queryRunner.manager.create(Inventory, {
            companyId: companyId,
            //inventoryId: v7(),
            invoiceId: savedInvoice.invoiceId,
            lineItemId: lineItem.lineItemId,
            invoiceType: InvoiceTypes.STOCK,
            gtn: serial ? SerialNumberHelper.formatSerial(serial.length || 0, (serial.current || 1) + i, serial.prefix || '') : lineItem.gtn,
            productId: lineItem.productId,
            unitId: lineItem.unitId,
            qtyOnHand: 1,
            description: lineItem.description,
            buyingPrice: lineItem.rate,
            marginPct: lineItem.marginPct,
            marginAmt: lineItem.marginAmt,
            sellingPrice: lineItem.sellingPrice,
            mfdDate: lineItem.mfdDate,
            expiryDate: lineItem.expiryDate
          });
          await InventoryService.saveInventory(queryRunner, inventory);

          // console.log(index - 1 + i, inventories[index - 1 + i].gtn);
        }
      }

      await queryRunner.commitTransaction();
      await cache.del(`stockInvoices_${companyId}_${yearId}`);
      return { success: true, message: 'Stock Invoice created successfully', data: savedInvoice, status: ApiStatus.CREATED };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: 'Failed to create Stock Invoice', status: ApiStatus.INTERNAL_SERVER_ERROR };
    } finally {
      await queryRunner.release();
    }
  }
}
