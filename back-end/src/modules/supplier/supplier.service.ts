import { Not } from "typeorm";

import { cache } from "../../helpers";

import { AppDataSource } from "../../data-source";
import { AuditUsers } from "../../entities";
import { ApiResponse, ApiStatus } from "../../responses";
import { parseError } from "../../helpers";
import { Supplier } from "./supplier.entity";
import { SupplierSchema } from "./supplier.schema";

export class SupplierService {
  private static supplierRepository = AppDataSource.getRepository(Supplier);

  static async getAllSuppliers(companyId: string): Promise<ApiResponse<Supplier[]>> {
    const data = await cache.get<Supplier[]>(`suppliers_${companyId}`);
    if (data) {
      return { success: true, message: "Serving suppliers from cache", data, status: ApiStatus.OK };
    }
    const suppliers = await this.supplierRepository.find({
      select: ["supplierId", "code", "name", "description", "address", "contact", "isActive"],
      where: { companyId },
      order: { companyId: "ASC", supplierId: "ASC" }
    });
    await cache.set(`suppliers_${companyId}`, suppliers);
    return { success: true, message: "Serving suppliers from database", data: suppliers, status: ApiStatus.OK };
  }

  static async getSupplierById(companyId: string, supplierId: string): Promise<ApiResponse<Supplier>> {
    const data = await cache.get<Supplier>("suppliers:" + supplierId);
    if (data) {
      return { success: true, message: "Serving a supplier from cache", data, status: ApiStatus.OK };
    }
    const supplier = await this.supplierRepository.findOne({
      select: ["supplierId", "code", "name", "description", "address", "contact", "isActive"],
      where: { companyId, supplierId }
    });
    if (!supplier) {
      return { success: false, message: `Supplier with id '${supplierId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await cache.set("suppliers:" + supplierId, supplier);
    return { success: true, message: "Serving supplier from database", data: supplier, status: ApiStatus.OK };
  }

  static async createSupplier(companyId: string, supplier: Supplier, userId: string): Promise<ApiResponse<Supplier>> {
    const parsedResult = SupplierSchema.safeParse(supplier);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }

    if (supplier.code && (await this.isSupplierCodeExists(companyId, supplier.code))) {
      return { success: false, message: `Supplier with code '${supplier.code}' already exists`, status: ApiStatus.BAD_REQUEST };
    }
    if (supplier.name && (await this.isSupplierNameExists(companyId, supplier.name))) {
      return { success: false, message: `Supplier with name '${supplier.name}' already exists`, status: ApiStatus.BAD_REQUEST };
    }

    const parsedSupplier = parsedResult.data as Supplier;
    parsedSupplier.companyId = companyId;
    parsedSupplier.user = { created: userId, updated: userId } as AuditUsers;
    const createSupplier = this.supplierRepository.create(parsedSupplier);
    const newSupplier = await this.supplierRepository.save<Supplier>(createSupplier);
    this.invalidateCache(companyId);
    return { success: true, message: "Supplier created successfully", data: newSupplier, status: ApiStatus.CREATED };
  }

  static async updateSupplier(companyId: string, supplierId: string, supplier: Partial<Supplier>, userId: string): Promise<ApiResponse<Supplier>> {
    const dbSupplier = await this.supplierRepository.findOneBy({ companyId, supplierId });
    if (!dbSupplier) {
      return { success: false, message: `Supplier with id '${supplierId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    if (supplier.code && (await this.isSupplierCodeExists(dbSupplier.companyId, supplier.code, supplierId))) {
      return { success: false, message: `Supplier with code '${supplier.code}' already exists`, status: ApiStatus.BAD_REQUEST };
    }
    if (supplier.name && (await this.isSupplierNameExists(dbSupplier.companyId, supplier.name, supplierId))) {
      return { success: false, message: `Supplier with name '${supplier.name}' already exists`, status: ApiStatus.BAD_REQUEST };
    }

    const auditUsers: AuditUsers = { ...dbSupplier.user, updated: userId };
    const updateSupplier = { ...dbSupplier, ...supplier, user: auditUsers };
    const parsedResult = SupplierSchema.safeParse(updateSupplier);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }
    const parsedSupplier = parsedResult.data as Supplier;
    const updatedSupplier = await this.supplierRepository.save(parsedSupplier);
    this.invalidateCache(dbSupplier.companyId, supplierId);
    return { success: true, message: "Supplier updated successfully", data: updatedSupplier, status: ApiStatus.OK };
  }

  static async deleteSupplier(companyId: string, supplierId: string): Promise<ApiResponse<Supplier>> {
    const supplier = await this.supplierRepository.findOneBy({ companyId, supplierId });
    if (!supplier) {
      return { success: false, message: `Supplier with id '${supplierId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await this.supplierRepository.remove(supplier);
    this.invalidateCache(supplier.companyId, supplierId);
    return { success: true, message: "Supplier deleted successfully", data: supplier, status: ApiStatus.OK };
  }

  static async isSupplierCodeExists(companyId: string, supplierCode: string, supplierId?: string): Promise<boolean> {
    let exists = true;
    if (supplierId) {
      exists = await this.supplierRepository.exists({ where: { companyId: companyId, code: supplierCode, supplierId: Not(supplierId) } });
      return exists;
    } else {
      exists = await this.supplierRepository.existsBy({ companyId: companyId, code: supplierCode });
      return exists;
    }
  }

  static async isSupplierNameExists(companyId: string, supplierName: string, supplierId?: string): Promise<boolean> {
    let exists = true;
    if (supplierId) {
      exists = await this.supplierRepository.exists({ where: { companyId: companyId, name: supplierName, supplierId: Not(supplierId) } });
      return exists;
    } else {
      exists = await this.supplierRepository.existsBy({ companyId: companyId, name: supplierName });
      return exists;
    }
  }

  static async invalidateCache(companyId: string, supplierId?: string): Promise<void> {
    await cache.del(`suppliers_${companyId}`);
    if (supplierId) await cache.del("suppliers:" + supplierId);
  }
}
