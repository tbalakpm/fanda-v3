import { Not } from "typeorm";

import { AppDataSource } from "../../data-source";
import { Year, AuditUsers } from "../../entities";
import { YearSchema } from "../../schema";
import { cache, parseError } from "../../helpers";
import { ApiResponse, ApiStatus } from "../../responses";

export class YearService {
  private static yearRepository = AppDataSource.getRepository(Year);

  static async getAllYears(companyId: string): Promise<ApiResponse<Year[]>> {
    const data = await cache.get<Year[]>(`years_${companyId}`);
    if (data) {
      return { success: true, message: "Serving years from cache", data, status: ApiStatus.OK };
    }
    const years = await this.yearRepository.find({
      select: ["yearId", "code", "description", "beginDate", "endDate", "isActive"],
      where: { companyId },
      order: { companyId: "ASC", yearId: "ASC" }
    });
    await cache.set(`years_${companyId}`, years);
    return { success: true, message: "Serving years from database", data: years, status: ApiStatus.OK };
  }

  static async getYearById(companyId: string, yearId: string): Promise<ApiResponse<Year>> {
    const data = await cache.get<Year>("years:" + yearId);
    if (data) {
      return { success: true, message: "Serving a year from cache", data, status: ApiStatus.OK };
    }
    const year = await this.yearRepository.findOne({
      select: ["yearId", "code", "description", "beginDate", "endDate", "isActive"],
      where: { companyId, yearId }
    });
    if (!year) {
      return { success: false, message: `Year with id '${yearId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await cache.set("years:" + yearId, year);
    return { success: true, message: "Serving year from database", data: year, status: ApiStatus.OK };
  }

  static async createYear(companyId: string, year: Year, userId: string): Promise<ApiResponse<Year>> {
    const parsedResult = YearSchema.safeParse(year);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }

    if (year.code && (await this.isYearCodeExists(companyId, year.code))) {
      return { success: false, message: `Year with code '${year.code}' already exists`, status: ApiStatus.BAD_REQUEST };
    }

    const parsedYear = parsedResult.data as Year;
    parsedYear.companyId = companyId;
    parsedYear.user = { created: userId, updated: userId } as AuditUsers;
    const createyear = this.yearRepository.create(parsedYear);
    const newyear = await this.yearRepository.save<Year>(createyear);
    this.invalidateCache(companyId);
    return { success: true, message: "year created successfully", data: newyear, status: ApiStatus.CREATED };
  }

  static async updateYear(companyId: string, yearId: string, year: Partial<Year>, userId: string): Promise<ApiResponse<Year>> {
    const dbyear = await this.yearRepository.findOneBy({ companyId, yearId });
    if (!dbyear) {
      return { success: false, message: `Year with id '${yearId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    if (year.code && (await this.isYearCodeExists(dbyear.companyId, year.code, yearId))) {
      return { success: false, message: `Year with code '${year.code}' already exists`, status: ApiStatus.BAD_REQUEST };
    }

    const auditUsers: AuditUsers = { ...dbyear.user, updated: userId };
    const updateyear = { ...dbyear, ...year, user: auditUsers };
    const parsedResult = YearSchema.safeParse(updateyear);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }
    const parsedyear = parsedResult.data as Year;
    const updatedyear = await this.yearRepository.save(parsedyear);
    this.invalidateCache(dbyear.companyId, yearId);
    return { success: true, message: "year updated successfully", data: updatedyear, status: ApiStatus.OK };
  }

  static async deleteYear(companyId: string, yearId: string): Promise<ApiResponse<Year>> {
    const year = await this.yearRepository.findOneBy({ companyId, yearId });
    if (!year) {
      return { success: false, message: `year with id '${yearId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await this.yearRepository.remove(year);
    this.invalidateCache(year.companyId, yearId);
    return { success: true, message: "year deleted successfully", data: year, status: ApiStatus.OK };
  }

  static async isYearCodeExists(companyId: string, yearCode: string, yearId?: string): Promise<boolean> {
    let exists = true;
    if (yearId) {
      exists = await this.yearRepository.exists({ where: { companyId: companyId, code: yearCode, yearId: Not(yearId) } });
      return exists;
    } else {
      exists = await this.yearRepository.existsBy({ companyId: companyId, code: yearCode });
      return exists;
    }
  }

  static async invalidateCache(companyId: string, yearId?: string): Promise<void> {
    await cache.del(`years_${companyId}`);
    if (yearId) await cache.del("years:" + yearId);
  }
}
