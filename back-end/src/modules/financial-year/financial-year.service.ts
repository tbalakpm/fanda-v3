import { Not } from 'typeorm';

import type { ApiResponse } from '../../responses/api-response';
import { cache } from '../../helpers/cache.helper';
import { ApiStatus } from '../../responses/api-status';
import { parseError } from '../../helpers/error.helper';

import { AppDataSource } from '../../data-source';
import { FinancialYear } from './financial-year.entity';
import { FinancialYearSchema } from './financial-year.schema';
import type { AuditUsers } from '../../entities/embedded/audit.entity';

// export class FinancialYearService {
const yearRepository = AppDataSource.getRepository(FinancialYear);

export async function getAllYears(companyId: string): Promise<ApiResponse<FinancialYear[]>> {
  const data = await cache.get<FinancialYear[]>(`years_${companyId}`);
  if (data) {
    return {
      success: true,
      message: 'Serving years from cache',
      data,
      status: ApiStatus.OK
    };
  }
  const years = await yearRepository.find({
    select: ['yearId', 'code', 'description', 'beginDate', 'endDate', 'isActive'],
    where: { companyId },
    order: { companyId: 'ASC', yearId: 'ASC' }
  });
  await cache.set(`years_${companyId}`, years);
  return {
    success: true,
    message: 'Serving years from database',
    data: years,
    status: ApiStatus.OK
  };
}

export async function getYearById(companyId: string, yearId: string): Promise<ApiResponse<FinancialYear>> {
  const data = await cache.get<FinancialYear>(`years:${yearId}`);
  if (data) {
    return {
      success: true,
      message: 'Serving a year from cache',
      data,
      status: ApiStatus.OK
    };
  }
  const year = await yearRepository.findOne({
    select: ['yearId', 'code', 'description', 'beginDate', 'endDate', 'isActive'],
    where: { companyId, yearId }
  });
  if (!year) {
    return {
      success: false,
      message: `Year with id '${yearId}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }
  await cache.set(`years:${yearId}`, year);
  return {
    success: true,
    message: 'Serving year from database',
    data: year,
    status: ApiStatus.OK
  };
}

export async function createYear(companyId: string, year: FinancialYear, userId: string): Promise<ApiResponse<FinancialYear>> {
  const parsedResult = FinancialYearSchema.safeParse(year);
  if (!parsedResult.success) {
    return {
      success: false,
      message: parseError(parsedResult),
      status: ApiStatus.BAD_REQUEST
    };
  }

  if (year.code && (await isYearCodeExists(companyId, year.code))) {
    return {
      success: false,
      message: `Year with code '${year.code}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }

  const parsedYear = parsedResult.data as FinancialYear;
  parsedYear.companyId = companyId;
  parsedYear.user = { created: userId, updated: userId } as AuditUsers;
  const createyear = yearRepository.create(parsedYear);
  const newyear = await yearRepository.save<FinancialYear>(createyear);
  invalidateCache(companyId);
  return {
    success: true,
    message: 'Year created successfully',
    data: newyear,
    status: ApiStatus.CREATED
  };
}

export async function updateYear(
  companyId: string,
  yearId: string,
  year: Partial<FinancialYear>,
  userId: string
): Promise<ApiResponse<FinancialYear>> {
  const dbyear = await yearRepository.findOneBy({ companyId, yearId });
  if (!dbyear) {
    return {
      success: false,
      message: `Year with id '${yearId}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }
  if (year.code && (await isYearCodeExists(dbyear.companyId, year.code, yearId))) {
    return {
      success: false,
      message: `Year with code '${year.code}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }

  const auditUsers: AuditUsers = { ...dbyear.user, updated: userId };
  const updateyear = { ...dbyear, ...year, user: auditUsers };
  const parsedResult = FinancialYearSchema.safeParse(updateyear);
  if (!parsedResult.success) {
    return {
      success: false,
      message: parseError(parsedResult),
      status: ApiStatus.BAD_REQUEST
    };
  }
  const parsedyear = parsedResult.data as FinancialYear;
  const updatedyear = await yearRepository.save(parsedyear);
  invalidateCache(dbyear.companyId, yearId);
  return {
    success: true,
    message: 'Year updated successfully',
    data: updatedyear,
    status: ApiStatus.OK
  };
}

export async function deleteYear(companyId: string, yearId: string): Promise<ApiResponse<FinancialYear>> {
  const year = await yearRepository.findOneBy({ companyId, yearId });
  if (!year) {
    return {
      success: false,
      message: `Year with id '${yearId}' not found`,
      status: ApiStatus.NOT_FOUND
    };
  }
  await yearRepository.remove(year);
  invalidateCache(year.companyId, yearId);
  return {
    success: true,
    message: 'Year deleted successfully',
    data: year,
    status: ApiStatus.OK
  };
}

export async function isYearCodeExists(companyId: string, yearCode: string, yearId?: string): Promise<boolean> {
  let exists = true;
  if (yearId) {
    exists = await yearRepository.exists({
      where: { companyId: companyId, code: yearCode, yearId: Not(yearId) }
    });
    return exists;
  }
  exists = await yearRepository.existsBy({
    companyId: companyId,
    code: yearCode
  });
  return exists;
}

async function invalidateCache(companyId: string, yearId?: string): Promise<void> {
  await cache.del(`years_${companyId}`);
  if (yearId) await cache.del(`years:${yearId}`);
}
// }
