import { type EntityManager, Not } from 'typeorm';

import { AppDataSource } from '../data-source';
import { Company } from '../entities/company.entity';
import type { Address } from '../entities/address.entity';
import type { Contact } from '../entities/contact.entity';
import type { AuditUsers } from '../entities/embedded/audit.entity';
import { CompanySchema } from '../schema/company.schema';
import { AddressSchema } from '../schema/address.schema';
import { ContactSchema } from '../schema/contact.schema';
import type { ApiResponse } from '../responses/api-response';
import { ApiStatus } from '../responses/api-status';
import { cache } from '../helpers/cache.helper';
import { parseError } from '../helpers/error.helper';
import * as CompanyDataSeeder from '../data-seed/company.data-seed';
import type { FinancialYear } from '../modules/financial-year/financial-year.entity';
import type { Customer } from '../modules/customer/customer.entity';
import type { Supplier } from '../modules/supplier/supplier.entity';
import type { ProductCategory } from '../modules/product-category/product-category.entity';
import type { Unit } from '../modules/unit/unit.entity';
import type { SerialNumber } from '../modules/serial-number/serial-number.entity';

const companyRepository = AppDataSource.getRepository(Company);

export async function getAllCompanies(): Promise<ApiResponse<Company[]>> {
  const data = await cache.get<Company[]>('companies');
  if (data) {
    return { success: true, message: 'Serving companies from cache', data, status: ApiStatus.OK, total: data.length };
  }
  const companies = await companyRepository.find({
    select: ['companyId', 'code', 'name', 'description', 'address', 'contact', 'isActive'],
    order: { companyId: 'ASC' }
  });
  await cache.set('companies', companies);
  return { success: true, message: 'Serving companies from database', data: companies, status: ApiStatus.OK, total: companies.length };
}

export async function getCompanyById(companyId: string): Promise<ApiResponse<Company>> {
  const data = await cache.get<Company>(`companies:${companyId}`);
  if (data) {
    return { success: true, message: 'Serving a company from cache', data, status: ApiStatus.OK };
  }
  const company = await companyRepository.findOne({
    select: ['companyId', 'code', 'name', 'description', 'address', 'contact', 'isActive'],
    where: { companyId }
  });
  if (!company) {
    return { success: false, message: `Company with id '${companyId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  await cache.set(`companies:${companyId}`, company);
  return { success: true, message: 'Serving company from database', data: company, status: ApiStatus.OK };
}

export async function createCompany(company: Company, userId: string): Promise<ApiResponse<Company>> {
  const parsedResult = CompanySchema.safeParse(company);
  if (!parsedResult.success) {
    return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
  }

  const parsedCompany = parsedResult.data as Company; //as any as Company;
  if (await isCompanyCodeExists(parsedCompany.code)) {
    return { success: false, message: `Company with code '${parsedCompany.code}' already exists`, status: ApiStatus.BAD_REQUEST };
  }
  if (await isCompanyNameExists(parsedCompany.name)) {
    return { success: false, message: `Company with name '${parsedCompany.name}' already exists`, status: ApiStatus.BAD_REQUEST };
  }

  // parsedCompany.companyId = v7();
  parsedCompany.user = { created: userId, updated: userId };

  const createCompany = companyRepository.create(parsedCompany);
  // Transaction starts here
  const result = AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
    const newCompany = await transactionalEntityManager.save<Company>(createCompany);
    // Seed company data
    const year = await transactionalEntityManager.save<FinancialYear>(CompanyDataSeeder.getNewYear(newCompany.companyId, userId, new Date()));
    await transactionalEntityManager.save<SerialNumber>(CompanyDataSeeder.getDefaultSequences(year.yearId));
    await transactionalEntityManager.save<Customer>(CompanyDataSeeder.getDefaultCashCustomer(newCompany.companyId, userId));
    await transactionalEntityManager.save<Supplier>(CompanyDataSeeder.getDefaultCashSupplier(newCompany.companyId, userId));
    await transactionalEntityManager.save<ProductCategory>(CompanyDataSeeder.getDefaultProductCategory(newCompany.companyId, userId));
    await transactionalEntityManager.save<Unit>(CompanyDataSeeder.getDefaultUnit(newCompany.companyId, userId));
    await invalidateCache();
    return { success: true, message: 'Company created successfully', data: newCompany, status: ApiStatus.CREATED };
  }).catch((error) => {
    return { success: false, message: error.message, status: ApiStatus.INTERNAL_SERVER_ERROR };
  });
  return result;
}

export async function updateCompany(companyId: string, company: Partial<Company>, userId: string): Promise<ApiResponse<Company>> {
  if (company.code && (await isCompanyCodeExists(company.code, companyId))) {
    return { success: false, message: `Company with code '${company.code}' already exists`, status: ApiStatus.BAD_REQUEST };
  }
  if (company.name && (await isCompanyNameExists(company.name, companyId))) {
    return { success: false, message: `Company with name '${company.name}' already exists`, status: ApiStatus.BAD_REQUEST };
  }
  const dbCompany = await companyRepository.findOneBy({ companyId });
  if (!dbCompany) {
    return { success: false, message: `Company with id '${companyId}' not found`, status: ApiStatus.NOT_FOUND };
  }

  let address: Address | undefined;
  const parsedAddress = AddressSchema.safeParse(company.address);
  if (parsedAddress.success) {
    address = { ...dbCompany.address, ...parsedAddress.data };
  } else {
    address = dbCompany.address;
  }
  let contact: Contact | undefined;
  const parsedContact = ContactSchema.safeParse(company.contact);
  if (parsedContact.success) {
    contact = { ...dbCompany.contact, ...parsedContact.data };
  } else {
    contact = dbCompany.contact;
  }
  const auditUsers: AuditUsers = { ...dbCompany.user, updated: userId };

  const updateCompany = {
    ...dbCompany,
    ...company,
    address,
    contact,
    user: auditUsers
  };
  const parsedResult = CompanySchema.safeParse(updateCompany);
  if (!parsedResult.success) {
    return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
  }
  const parsedCompany = parsedResult.data as Company;
  const updatedCompany = await companyRepository.save(parsedCompany);
  await invalidateCache(companyId);
  return { success: true, message: 'Company updated successfully', data: updatedCompany, status: ApiStatus.OK };
}

export async function deleteCompany(companyId: string): Promise<ApiResponse<Company>> {
  const company = await companyRepository.findOneBy({ companyId });
  if (!company) {
    return { success: false, message: `Company with id '${companyId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  await companyRepository.remove(company);
  await invalidateCache(companyId);
  return { success: true, message: 'Company deleted successfully', data: company, status: ApiStatus.OK };
}

export async function isCompanyCodeExists(companyCode: string, companyId?: string): Promise<boolean> {
  let exists = true;
  if (companyId) {
    exists = await companyRepository.exists({
      where: { code: companyCode, companyId: Not(companyId) }
    });
    return exists;
  }
  exists = await companyRepository.existsBy({ code: companyCode });
  return exists;
}

export async function isCompanyNameExists(companyName: string, companyId?: string): Promise<boolean> {
  let exists = true;
  if (companyId) {
    exists = await companyRepository.exists({
      where: { name: companyName, companyId: Not(companyId) }
    });
    return exists;
  }
  exists = await companyRepository.existsBy({ name: companyName });
  return exists;
}

async function invalidateCache(companyId?: string): Promise<void> {
  await cache.del('companies');
  if (companyId) await cache.del(`companies:${companyId}`);
}
