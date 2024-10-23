import cache from "../helpers/cache-helper";

import { AppDataSource } from "../data-source";
import { CompanySchema } from "../schema/company.schema";
import { Company } from "../entities";
import { Not } from "typeorm";
import { ApiResponse, ApiStatus } from "../responses";
import { v7 } from "uuid";

export class CompanyService {
  private static companyRepository = AppDataSource.getRepository(Company);

  static async getAllCompanies(): Promise<ApiResponse<Company[]>> {
    const data = await cache.get<Company[]>("companies");
    if (data) {
      return {
        success: true,
        message: "Serving companies from cache",
        data,
        status: ApiStatus.OK
      };
    } else {
      const companies = await this.companyRepository.find();
      await cache.set("companies", companies);
      return {
        success: true,
        message: "Serving companies from database",
        data: companies,
        status: ApiStatus.OK
      };
    }
  }

  static async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    const data = await cache.get<Company>("companies:" + id);
    if (data) {
      return {
        success: true,
        message: "Serving a company from cache",
        data,
        status: ApiStatus.OK
      };
    } else {
      const company = await this.companyRepository.findOneBy({ id });
      if (!company) {
        return {
          success: false,
          message: `Company with id '${id}' not found`,
          status: ApiStatus.NOT_FOUND
        };
      }
      await cache.set("companies:" + id, company);
      return {
        success: true,
        message: "Serving company from database",
        data: company,
        status: ApiStatus.OK
      };
    }
  }

  static async createCompany(company: Company, userId: string): Promise<ApiResponse<Company>> {
    const parsedResult = CompanySchema.safeParse(company);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parsedResult.error.message,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedCompany = parsedResult.data as Company; //as any as Company;
    if (await this.isCompanyCodeExists(parsedCompany.code)) {
      return {
        success: false,
        message: `Company with code '${parsedCompany.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (await this.isCompanyNameExists(parsedCompany.name)) {
      return {
        success: false,
        message: `Company with name '${parsedCompany.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    parsedCompany.id = v7();
    parsedCompany.user = { created: userId, updated: userId };

    const createCompany = this.companyRepository.create(parsedCompany);
    const newCompany = await this.companyRepository.save<Company>(createCompany);
    this.invalidateCache();
    return {
      success: true,
      message: "Company created successfully",
      data: newCompany,
      status: ApiStatus.CREATED
    };
  }

  static async updateCompany(
    id: string,
    company: Company,
    userId: string
  ): Promise<ApiResponse<Company>> {
    const parsedResult = CompanySchema.safeParse(company);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parsedResult.error.message,
        status: ApiStatus.BAD_REQUEST
      };
    }
    const parsedCompany = parsedResult.data as Company;
    if (await this.isCompanyCodeExists(parsedCompany.code, id)) {
      return {
        success: false,
        message: `Company with code '${parsedCompany.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (await this.isCompanyNameExists(parsedCompany.name, id)) {
      return {
        success: false,
        message: `Company with name '${parsedCompany.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    const dbCompany = await this.companyRepository.findOneBy({ id });
    if (!dbCompany) {
      return {
        success: false,
        message: `Company with id '${id}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    dbCompany.address = parsedCompany.address;
    dbCompany.contact = parsedCompany.contact;
    dbCompany.description = parsedCompany.description;
    dbCompany.name = parsedCompany.name;
    dbCompany.user.updated = userId;

    const updatedCompany = await this.companyRepository.save(dbCompany);
    this.invalidateCache(id);
    return {
      success: true,
      message: "Company updated successfully",
      data: updatedCompany,
      status: ApiStatus.OK
    };
  }

  static async deleteCompany(id: string): Promise<ApiResponse<Company>> {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      return {
        success: false,
        message: `Company with id '${id}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await this.companyRepository.remove(company);
    this.invalidateCache(id);
    return {
      success: true,
      message: "Company deleted successfully",
      data: company,
      status: ApiStatus.OK
    };
  }

  static async isCompanyCodeExists(companyCode: string, companyId?: string): Promise<boolean> {
    let exists = true;
    if (companyId) {
      exists = await this.companyRepository.exists({
        where: { code: companyCode, id: Not(companyId) }
      });
      return exists;
    } else {
      exists = await this.companyRepository.existsBy({ code: companyCode });
      return exists;
    }
  }

  static async isCompanyNameExists(companyName: string, companyId?: string): Promise<boolean> {
    let exists = true;
    if (companyId) {
      exists = await this.companyRepository.exists({
        where: { name: companyName, id: Not(companyId) }
      });
      return exists;
    } else {
      exists = await this.companyRepository.existsBy({ name: companyName });
      return exists;
    }
  }

  static async invalidateCache(id?: string): Promise<void> {
    await cache.del("companies");
    if (id) await cache.del("companies:" + id);
  }
}
