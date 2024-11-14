import { AppDataSource } from "../data-source";
import { SerialNumber } from "../modules/serial-number/serial-number.entity";

export class SerialNumberHelper {
  private static readonly serialRepository = AppDataSource.getRepository(SerialNumber);

  static async getNextSerial(key: string, yearId: string): Promise<string> {
    // const result = await this.serialRepository.update({ yearId, key }, { current: () => "current + 1" });
    const result = await this.serialRepository
      .createQueryBuilder()
      .update(SerialNumber)
      .set({ current: () => "current + 1" })
      .where("yearId = :yearId", { yearId })
      .andWhere("key = :key", { key })
      .returning("*")
      .execute();
    const serial = result.raw[0];

    if (!serial) {
      return "";
    }

    const nextSerial = this.formatSerial(serial.length, serial.current - 1, serial.prefix);
    return nextSerial;
  }

  /*
  static async getNextRangeSerial(count: number, key: string, yearId: string | null | undefined) {
    const organization = await OrganizationModel.findOneAndUpdate(
      {
        "years._id": yearId,
        "years.sequences.key": key
      },
      {
        $inc: { "years.$[year].sequences.$[sequence].current": count }
      },
      {
        arrayFilters: [{ "year._id": yearId }, { "sequence.key": key }],
        session,
        new: false,
        upsert: true
      }
    );

    if (!organization) {
      return { currentSerial: "", nextSerial: "", sequence: {} };
    }

    const sequence = organization.years.id(yearId)?.sequences.find((s) => s.key === key);
    if (!sequence) {
      return { currentSerial: "", nextSerial: "", sequence: {} };
    }
    const currentSerial = this.formatSerial(sequence.length, sequence.current, sequence.prefix);
    const nextSerial = this.formatSerial(sequence.length, sequence.current + (count - 1), sequence.prefix);
    return {
      currentSerial,
      nextSerial,
      sequence: { current: sequence.current, length: sequence.length, prefix: sequence.prefix }
    };
  }
  */

  static formatSerial(length: number, value: number, prefix?: string): string {
    return `${prefix ? prefix : ""}${String(value).padStart(length, "0")}`;
  }
}
