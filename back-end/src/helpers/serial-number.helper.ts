import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../data-source';
import { SerialNumber } from '../modules/serial-number/serial-number.entity';
import { InvoiceTypes } from '../modules/invoices/invoice-type.enum';

export class SerialNumberHelper {
  private static readonly serialRepository = AppDataSource.getRepository(SerialNumber);

  static async getNextSerial(queryRunner: QueryRunner, yearId: string, key: InvoiceTypes | 'gtn'): Promise<string> {
    const serial = await this.incrementSerial(queryRunner, yearId, key, 1);

    if (!serial) {
      return '';
    }
    const endSerial = this.formatSerial(serial.length, serial.current - 1, serial.prefix);
    return endSerial;
  }

  static async getNextRangeSerial(
    queryRunner: QueryRunner,
    yearId: string,
    key: InvoiceTypes | 'gtn',
    count: number
  ): Promise<{ beginSerial: string; endSerial: string; serial: { current?: number; length?: number; prefix?: string } }> {
    const serial = await this.incrementSerial(queryRunner, yearId, key, count);
    if (!serial) {
      return { beginSerial: '', endSerial: '', serial: {} };
    }

    const beginSerial = this.formatSerial(serial.length, serial.current - count, serial.prefix);
    const endSerial = this.formatSerial(serial.length, serial.current - count + (count - 1), serial.prefix);
    return {
      beginSerial,
      endSerial,
      serial: { current: serial.current - count, length: serial.length, prefix: serial.prefix }
    };
  }

  static formatSerial(length: number, value: number, prefix?: string): string {
    return `${prefix ? prefix : ''}${String(value).padStart(length, '0')}`;
  }

  static async incrementSerial(queryRunner: QueryRunner, yearId: string, key: InvoiceTypes | 'gtn', count: number): Promise<SerialNumber> {
    const result = await queryRunner.manager.query(
      'UPDATE serial_numbers SET current = (current + $1) WHERE year_id = $2 AND key = $3 RETURNING length, current, prefix',
      [count, yearId, key]
    );
    // console.log('INCREMENT_SERIAL:', result[0][0]);
    return result[0][0];
  }
}

export const DefaultSerials = [
  {
    key: InvoiceTypes.Purchase,
    prefix: 'I',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.Sales,
    prefix: 'B',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.SalesReturn,
    prefix: 'R',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.PurchaseReturn,
    prefix: 'U',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.Stock,
    prefix: 'K',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.Transfer,
    prefix: 'T',
    current: 1,
    length: 7
  },
  {
    key: 'gtn',
    prefix: 'A',
    current: 1,
    length: 7
  }
];
