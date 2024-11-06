import { Not } from "typeorm";

import { AppDataSource } from "../../data-source";
import { Unit, AuditUsers } from "../../entities";
import { UnitSchema } from "../../schema";
import { cache, parseError } from "../../helpers";
import { ApiResponse, ApiStatus } from "../../responses";

export class UnitService {
  private static unitRepository = AppDataSource.getRepository(Unit);

  static async getAllUnits(companyId: string): Promise<ApiResponse<Unit[]>> {
    const data = await cache.get<Unit[]>(`units_${companyId}`);
    if (data) {
      return { success: true, message: "Serving units from cache", data, status: ApiStatus.OK };
    }
    const units = await this.unitRepository.find({
      select: ["unitId", "code", "name", "description", "baseUnitId", "isActive"],
      where: { companyId },
      order: { companyId: "ASC", unitId: "ASC" }
    });
    await cache.set(`units_${companyId}`, units);
    return { success: true, message: "Serving units from database", data: units, status: ApiStatus.OK };
  }

  static async getUnitById(companyId: string, unitId: string): Promise<ApiResponse<Unit>> {
    const data = await cache.get<Unit>("units:" + unitId);
    if (data) {
      return { success: true, message: "Serving a unit from cache", data, status: ApiStatus.OK };
    }
    const unit = await this.unitRepository.findOne({
      select: ["unitId", "code", "name", "description", "baseUnitId", "isActive"],
      where: { companyId, unitId }
    });
    if (!unit) {
      return { success: false, message: `Unit with id '${unitId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await cache.set("units:" + unitId, unit);
    return { success: true, message: "Serving unit from database", data: unit, status: ApiStatus.OK };
  }

  static async createUnit(companyId: string, unit: Unit, userId: string): Promise<ApiResponse<Unit>> {
    const parsedResult = UnitSchema.safeParse(unit);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }

    if (unit.code && (await this.isUnitCodeExists(companyId, unit.code))) {
      return { success: false, message: `Unit with code '${unit.code}' already exists`, status: ApiStatus.BAD_REQUEST };
    }
    if (unit.name && (await this.isUnitNameExists(companyId, unit.name))) {
      return { success: false, message: `Unit with name '${unit.name}' already exists`, status: ApiStatus.BAD_REQUEST };
    }

    const parsedUnit = parsedResult.data as Unit;
    parsedUnit.companyId = companyId;
    parsedUnit.user = { created: userId, updated: userId } as AuditUsers;
    const createUnit = this.unitRepository.create(parsedUnit);
    const newUnit = await this.unitRepository.save<Unit>(createUnit);
    this.invalidateCache(companyId);
    return { success: true, message: "Unit created successfully", data: newUnit, status: ApiStatus.CREATED };
  }

  static async updateUnit(companyId: string, unitId: string, unit: Partial<Unit>, userId: string): Promise<ApiResponse<Unit>> {
    const dbUnit = await this.unitRepository.findOneBy({ companyId, unitId });
    if (!dbUnit) {
      return { success: false, message: `Unit with id '${unitId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    if (unit.code && (await this.isUnitCodeExists(dbUnit.companyId, unit.code, unitId))) {
      return { success: false, message: `Unit with code '${unit.code}' already exists`, status: ApiStatus.BAD_REQUEST };
    }
    if (unit.name && (await this.isUnitNameExists(dbUnit.companyId, unit.name, unitId))) {
      return { success: false, message: `Unit with name '${unit.name}' already exists`, status: ApiStatus.BAD_REQUEST };
    }

    const auditUsers: AuditUsers = { ...dbUnit.user, updated: userId };
    const updateUnit = { ...dbUnit, ...unit, user: auditUsers };
    const parsedResult = UnitSchema.safeParse(updateUnit);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }
    const parsedUnit = parsedResult.data as Unit;
    const updatedUnit = await this.unitRepository.save(parsedUnit);
    this.invalidateCache(dbUnit.companyId, unitId);
    return { success: true, message: "Unit updated successfully", data: updatedUnit, status: ApiStatus.OK };
  }

  static async deleteUnit(companyId: string, unitId: string): Promise<ApiResponse<Unit>> {
    const unit = await this.unitRepository.findOneBy({ companyId, unitId });
    if (!unit) {
      return { success: false, message: `Unit with id '${unitId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await this.unitRepository.remove(unit);
    this.invalidateCache(unit.companyId, unitId);
    return { success: true, message: "Unit deleted successfully", data: unit, status: ApiStatus.OK };
  }

  static async isUnitCodeExists(companyId: string, unitCode: string, unitId?: string): Promise<boolean> {
    let exists = true;
    if (unitId) {
      exists = await this.unitRepository.exists({ where: { companyId: companyId, code: unitCode, unitId: Not(unitId) } });
      return exists;
    } else {
      exists = await this.unitRepository.existsBy({ companyId: companyId, code: unitCode });
      return exists;
    }
  }

  static async isUnitNameExists(companyId: string, unitName: string, unitId?: string): Promise<boolean> {
    let exists = true;
    if (unitId) {
      exists = await this.unitRepository.exists({ where: { companyId: companyId, name: unitName, unitId: Not(unitId) } });
      return exists;
    } else {
      exists = await this.unitRepository.existsBy({ companyId: companyId, name: unitName });
      return exists;
    }
  }

  static async invalidateCache(companyId: string, unitId?: string): Promise<void> {
    await cache.del(`units_${companyId}`);
    if (unitId) await cache.del("units:" + unitId);
  }
}
