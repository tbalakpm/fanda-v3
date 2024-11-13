import { AppDataSource } from "../data-source";
import { SequenceGenerator } from "../modules/sequence-generator/sequence-generator.entity";

export class SequenceGeneratorHelper {
  private static readonly SEQUENCE_LENGTH = 7;
  private static readonly SEQUENCE_PREFIX = "";
  private static readonly SEQUENCE_CURRENT = 0;
  private static readonly sequenceRepository = AppDataSource.getRepository(SequenceGenerator);

  static async getNextSerial(key: string, yearId: string) {
    // const sequence = await this.sequenceRepository.save({ where: { key, yearId }, data: { current: { increment: 1 } } });
    // const sequence = await AppDataSource.createQueryBuilder(GeneratedSequence, "sequence")
    //   .update(GeneratedSequence)
    //   .set({ current: () => "current + 1" })
    //   .where("sequence.key = :key", { key })
    //   .andWhere("sequence.yearId = :yearId", { yearId })
    //   .returning(["current", "length", "prefix"])
    //   .execute();

    const result = await this.sequenceRepository.update({ key, yearId }, { current: () => "current + 1" });
    const sequence = result.raw[0];

    console.log("result", result);

    if (!sequence) {
      return "";
    }

    const nextSerial = this.formatSerial(sequence.length, sequence.generatedMaps.current, sequence.prefix);
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
  static formatSerial(length: number, value: number, prefix: string | null | undefined) {
    return `${prefix ? prefix : ""}${String(value).padStart(length, "0")}`;
  }
}
