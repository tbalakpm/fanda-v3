import { Not } from "typeorm";

import cache from "../../helpers/cache-helper";

import { AppDataSource } from "../../data-source";
import { Company, Unit } from "../../entities";
import { ApiResponse, ApiStatus } from "../../responses";
import { UnitSchema } from "../../schema";
import { v7 } from "uuid";

export class UnitService {
  private static unitRepository = AppDataSource.getRepository(Unit);

  static async getAllUnits(companyId: string): Promise<ApiResponse<Unit[]>> {
    // const data = await cache.get<Unit[]>(`units_${companyId}`);
    // if (data) {
    //   return { success: true, message: "Serving units from cache", data, httpStatusCode: 200 };
    // } else {
    // const units = await this.unitRepository.find({
    //   where: { companyId: companyId }
    //   // order: { name: "ASC" },
    //   // relations: ["baseUnitId", "companyId"],
    //   // select: [
    //   //   "id",
    //   //   "code",
    //   //   "name",
    //   //   "description",
    //   //   "baseUnitId",
    //   //   "companyId",
    //   //   "user",
    //   //   "date",
    //   //   "isActive"
    //   // ],
    //   // withDeleted: true,
    //   // cache: true,
    //   // loadRelationIds: true,
    //   // relationLoadStrategy: "join",
    //   // loadEagerRelations: true
    // });
    // await cache.set(`units_${companyId}`, units);

    // const units = await this.unitRepository
    //   .createQueryBuilder("unit")
    //   .where("unit.companyId = :companyId", { companyId })
    //   .getMany();

    const units = await this.unitRepository.find({
      where: { company: { id: companyId } },
      select: [
        "id",
        "code",
        "name",
        "description",
        "baseUnitId",
        "isActive",
        "company",
        "user",
        "date"
      ]
      // relations: ["company"]
    });

    return {
      success: true,
      message: "Serving units from database",
      data: units,
      status: ApiStatus.OK
    };
    // }
  }

  static async getUnitById(id: string): Promise<ApiResponse<Unit>> {
    const data = await cache.get<Unit>("units:" + id);
    if (data) {
      return {
        success: true,
        message: "Serving a unit from cache",
        data,
        status: ApiStatus.OK
      };
    } else {
      const unit = await this.unitRepository.findOne({
        where: { id },
        relations: ["baseUnitId", "company", "user"],
        select: [
          "id",
          "code",
          "name",
          "description",
          "baseUnitId",
          "isActive",
          "company",
          "user",
          "date"
        ]
      });
      if (!unit) {
        return {
          success: false,
          message: `Unit with id '${id}' not found`,
          status: ApiStatus.NOT_FOUND
        };
      }
      await cache.set("units:" + id, unit);
      return {
        success: true,
        message: "Serving unit from database",
        data: unit,
        status: ApiStatus.OK
      };
    }
  }

  static async createUnit(
    companyId: string,
    unit: Unit,
    userId: string
  ): Promise<ApiResponse<Unit>> {
    const parsedResult = UnitSchema.safeParse(unit);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parsedResult.error.message,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedUnit = parsedResult.data as Unit;
    // if (await this.isUnitCodeExists(companyId, parsedUnit.code)) {
    //   return {
    //     success: false,
    //     message: `Unit with code '${parsedUnit.code}' already exists`,
    //     httpStatusCode: 400
    //   };
    // }
    // if (await this.isUnitNameExists(companyId, parsedUnit.name)) {
    //   return {
    //     success: false,
    //     message: `Unit with name '${parsedUnit.name}' already exists`,
    //     httpStatusCode: 400
    //   };
    // }

    parsedUnit.id = v7();
    parsedUnit.company = { id: companyId } as Company;
    parsedUnit.user = { created: userId, updated: userId };
    const createUnit = this.unitRepository.create(parsedUnit);
    const newUnit = await this.unitRepository.save<Unit>(createUnit);
    this.invalidateCache(companyId);
    return {
      success: true,
      message: "Unit created successfully",
      data: newUnit,
      status: ApiStatus.CREATED
    };
  }

  static async updateUnit(id: string, unit: Unit, userId: string): Promise<ApiResponse<Unit>> {
    const parsedResult = UnitSchema.safeParse(unit);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parsedResult.error.message,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedUnit = parsedResult.data as Unit;
    const dbUnit = await this.unitRepository.findOneBy({ id });
    if (!dbUnit) {
      return {
        success: false,
        message: `Unit with id '${id}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    if (await this.isUnitCodeExists(dbUnit.company.id, parsedUnit.code, id)) {
      return {
        success: false,
        message: `Unit with code '${parsedUnit.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (await this.isUnitNameExists(dbUnit.company.id, parsedUnit.name, id)) {
      return {
        success: false,
        message: `Unit with name '${parsedUnit.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    dbUnit.code = parsedUnit.code;
    dbUnit.name = parsedUnit.name;
    dbUnit.description = parsedUnit.description;
    dbUnit.user.updated = userId;
    const updatedUnit = await this.unitRepository.save(dbUnit);
    this.invalidateCache(dbUnit.company.id, id);
    return {
      success: true,
      message: "Unit updated successfully",
      data: updatedUnit,
      status: ApiStatus.OK
    };
  }

  static async deleteUnit(id: string): Promise<ApiResponse<Unit>> {
    const unit = await this.unitRepository.findOneBy({ id });
    if (!unit) {
      return {
        success: false,
        message: `Unit with id '${id}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await this.unitRepository.remove(unit);
    this.invalidateCache(unit.company.id, id);
    return {
      success: true,
      message: "Unit deleted successfully",
      data: unit,
      status: ApiStatus.OK
    };
  }

  static async isUnitCodeExists(
    companyId: string,
    unitCode: string,
    unitId?: string
  ): Promise<boolean> {
    let exists = true;
    if (unitId) {
      exists = await this.unitRepository.exists({
        where: { company: { id: companyId }, code: unitCode, id: Not(unitId) }
      });
      return exists;
    } else {
      exists = await this.unitRepository.existsBy({ company: { id: companyId }, code: unitCode });
      return exists;
    }
  }

  static async isUnitNameExists(
    companyId: string,
    unitName: string,
    unitId?: string
  ): Promise<boolean> {
    let exists = true;
    if (unitId) {
      exists = await this.unitRepository.exists({
        where: { company: { id: companyId }, name: unitName, id: Not(unitId) }
      });
      return exists;
    } else {
      exists = await this.unitRepository.existsBy({ company: { id: companyId }, name: unitName });
      return exists;
    }
  }

  static async invalidateCache(companyId: string, id?: string): Promise<void> {
    await cache.del(`units_${companyId}`);
    if (id) await cache.del("units:" + id);
  }
}
