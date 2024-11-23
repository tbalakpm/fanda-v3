import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../data-source';
import { SerialNumber } from '../modules/serial-number/serial-number.entity';

export class SerialNumberHelper {
  private static readonly serialRepository = AppDataSource.getRepository(SerialNumber);

  static async getNextSerial(queryRunner: QueryRunner, key: string, yearId: string): Promise<string> {
    const result = await queryRunner.manager //this.serialRepository
      .createQueryBuilder()
      .update(SerialNumber)
      .set({ current: () => 'current + 1' })
      .where('yearId = :yearId', { yearId })
      .andWhere('key = :key', { key })
      .returning('length, current, prefix')
      .execute();
    const serial = result.raw[0];
    if (!serial) {
      return '';
    }
    const endSerial = this.formatSerial(serial.length, serial.current - 1, serial.prefix);
    return endSerial;
  }

  static async getNextRangeSerial(
    queryRunner: QueryRunner,
    count: number,
    key: string,
    yearId?: string
  ): Promise<{ beginSerial: string; endSerial: string; serial: { current?: number; length?: number; prefix?: string } }> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .update(SerialNumber)
      .set({ current: () => `current + ${count}` })
      .where('yearId = :yearId', { yearId })
      .andWhere('key = :key', { key })
      .returning('length, current, prefix')
      .execute();
    const serial = result.raw[0];
    // console.log("serial", serial);

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
}
