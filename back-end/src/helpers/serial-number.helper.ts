import type { QueryRunner } from 'typeorm';
import type { SerialNumber } from '../modules/serial-number/serial-number.entity';
import type { InvoiceTypes } from '../modules/invoices/invoice-type.enum';

export async function getNextSerial(queryRunner: QueryRunner, yearId: string, key: InvoiceTypes | 'gtn'): Promise<string> {
  const serial = await incrementSerial(queryRunner, yearId, key, 1);

  if (!serial) {
    return '';
  }
  const endSerial = formatSerial(serial.length, serial.current - 1, serial.prefix);
  return endSerial;
}

export async function getNextRangeSerial(
  queryRunner: QueryRunner,
  yearId: string,
  key: InvoiceTypes | 'gtn',
  count: number
): Promise<{ beginSerial: string; endSerial: string; serial: { current?: number; length?: number; prefix?: string } }> {
  const serial = await incrementSerial(queryRunner, yearId, key, count);
  if (!serial) {
    return { beginSerial: '', endSerial: '', serial: {} };
  }

  const beginSerial = formatSerial(serial.length, serial.current - count, serial.prefix);
  const endSerial = formatSerial(serial.length, serial.current - count + (count - 1), serial.prefix);
  return {
    beginSerial,
    endSerial,
    serial: { current: serial.current - count, length: serial.length, prefix: serial.prefix }
  };
}

export function formatSerial(length: number, value: number, prefix?: string): string {
  return `${prefix ? prefix : ''}${String(value).padStart(length, '0')}`;
}

export async function incrementSerial(queryRunner: QueryRunner, yearId: string, key: InvoiceTypes | 'gtn', count: number): Promise<SerialNumber> {
  const result = await queryRunner.manager.query(
    'UPDATE serial_numbers SET current = (current + $1) WHERE year_id = $2 AND key = $3 RETURNING length, current, prefix',
    [count, yearId, key]
  );
  return result[0][0];
}
