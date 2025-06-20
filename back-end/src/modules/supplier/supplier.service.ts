import { Not } from 'typeorm';
import { cache } from '../../helpers/cache.helper';
import { AppDataSource } from '../../data-source';
import type { AuditUsers } from '../../entities/embedded/audit.entity';
import { parseError } from '../../helpers/error.helper';
import { Supplier } from './supplier.entity';
import type { ApiResponse } from '../../responses/api-response';
import { ApiStatus } from '../../responses/api-status';
import { PartyDto } from '../../dto';
import { SupplierSchema } from './supplier.schema';

// export class SupplierService {
const supplierRepository = AppDataSource.getRepository(Supplier);

export async function getAllSuppliers(companyId: string): Promise<ApiResponse<PartyDto[]>> {
  const data = await cache.get<PartyDto[]>(`suppliers_${companyId}`);
  if (data) {
    return { success: true, message: 'Serving suppliers from cache', data, status: ApiStatus.OK };
  }
  const suppliers = await supplierRepository.find({
    select: ['supplierId', 'code', 'name', 'description', 'address', 'contact', 'gstin', 'gstTreatment', 'isActive'],
    where: { companyId },
    order: { companyId: 'ASC', supplierId: 'ASC' }
  });
  const parties = suppliers.map(
    (supplier) =>
      new PartyDto({
        id: supplier.supplierId,
        code: supplier.code,
        name: supplier.name,
        description: supplier.description,
        address: supplier.address,
        contact: supplier.contact,
        gstin: supplier.gstin,
        gstTreatment: supplier.gstTreatment,
        isActive: supplier.isActive
      })
  );
  await cache.set(`suppliers_${companyId}`, parties);
  return { success: true, message: 'Serving suppliers from database', data: parties, status: ApiStatus.OK };
}

export async function getSupplierById(_companyId: string, supplierId: string): Promise<ApiResponse<PartyDto>> {
  const data = await cache.get<PartyDto>(`suppliers:${supplierId}`);
  if (data) {
    return { success: true, message: 'Serving a supplier from cache', data, status: ApiStatus.OK };
  }
  const supplier = await supplierRepository.findOne({
    select: ['supplierId', 'code', 'name', 'description', 'address', 'contact', 'gstin', 'gstTreatment', 'isActive'],
    where: { supplierId }
  });
  if (!supplier) {
    return { success: false, message: `Supplier with id '${supplierId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  const party = new PartyDto({
    id: supplier.supplierId,
    code: supplier.code,
    name: supplier.name,
    description: supplier.description,
    address: supplier.address,
    contact: supplier.contact,
    gstin: supplier.gstin,
    gstTreatment: supplier.gstTreatment,
    isActive: supplier.isActive
  });
  await cache.set(`suppliers:${supplierId}`, party);
  return { success: true, message: 'Serving supplier from database', data: party, status: ApiStatus.OK };
}

export async function createSupplier(companyId: string, party: Omit<PartyDto, 'id'>, userId: string): Promise<ApiResponse<PartyDto>> {
  const supplier = { ...party, isActive: true };
  const parsedResult = SupplierSchema.safeParse(supplier);
  if (!parsedResult.success) {
    return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
  }

  if (supplier.code && (await isSupplierCodeExists(companyId, supplier.code))) {
    return { success: false, message: `Supplier with code '${supplier.code}' already exists`, status: ApiStatus.BAD_REQUEST };
  }
  if (supplier.name && (await isSupplierNameExists(companyId, supplier.name))) {
    return { success: false, message: `Supplier with name '${supplier.name}' already exists`, status: ApiStatus.BAD_REQUEST };
  }

  const parsedSupplier = parsedResult.data as Supplier;
  parsedSupplier.companyId = companyId;
  parsedSupplier.user = { created: userId, updated: userId } as AuditUsers;
  const createSupplier = supplierRepository.create(parsedSupplier);
  const newSupplier = await supplierRepository.save<Supplier>(createSupplier);
  const newParty = new PartyDto({
    id: newSupplier.supplierId,
    code: newSupplier.code,
    name: newSupplier.name,
    description: newSupplier.description,
    address: newSupplier.address,
    contact: newSupplier.contact,
    isActive: newSupplier.isActive
  });
  invalidateCache(companyId);
  return { success: true, message: 'Supplier created successfully', data: newParty, status: ApiStatus.CREATED };
}

export async function updateSupplier(
  _companyId: string,
  supplierId: string,
  party: Partial<Omit<PartyDto, 'id'>>,
  userId: string
): Promise<ApiResponse<PartyDto>> {
  const supplier = { ...party, supplierId };
  const dbSupplier = await supplierRepository.findOneBy({ supplierId });
  if (!dbSupplier) {
    return { success: false, message: `Supplier with id '${supplierId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  if (supplier.code && (await isSupplierCodeExists(dbSupplier.companyId, supplier.code, supplierId))) {
    return { success: false, message: `Supplier with code '${supplier.code}' already exists`, status: ApiStatus.BAD_REQUEST };
  }
  if (supplier.name && (await isSupplierNameExists(dbSupplier.companyId, supplier.name, supplierId))) {
    return { success: false, message: `Supplier with name '${supplier.name}' already exists`, status: ApiStatus.BAD_REQUEST };
  }

  const auditUsers: AuditUsers = { ...dbSupplier.user, updated: userId };
  const updateSupplier = { ...dbSupplier, ...supplier, user: auditUsers };
  const parsedResult = SupplierSchema.safeParse(updateSupplier);
  if (!parsedResult.success) {
    return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
  }
  const parsedSupplier = parsedResult.data as Supplier;
  const updatedSupplier = await supplierRepository.save(parsedSupplier);
  const updatedParty = new PartyDto({
    id: updatedSupplier.supplierId,
    code: updatedSupplier.code,
    name: updatedSupplier.name,
    description: updatedSupplier.description,
    address: updatedSupplier.address,
    contact: updatedSupplier.contact,
    isActive: updatedSupplier.isActive
  });
  invalidateCache(dbSupplier.companyId, supplierId);
  return { success: true, message: 'Supplier updated successfully', data: updatedParty, status: ApiStatus.OK };
}

export async function deleteSupplier(_companyId: string, supplierId: string): Promise<ApiResponse<Supplier>> {
  const supplier = await supplierRepository.findOneBy({ supplierId });
  if (!supplier) {
    return { success: false, message: `Supplier with id '${supplierId}' not found`, status: ApiStatus.NOT_FOUND };
  }
  await supplierRepository.remove(supplier);
  invalidateCache(supplier.companyId, supplierId);
  return { success: true, message: 'Supplier deleted successfully', data: supplier, status: ApiStatus.OK };
}

export async function isSupplierCodeExists(companyId: string, supplierCode: string, supplierId?: string): Promise<boolean> {
  let exists = true;
  if (supplierId) {
    exists = await supplierRepository.exists({
      where: { companyId: companyId, code: supplierCode, supplierId: Not(supplierId) }
    });
    return exists;
  }
  exists = await supplierRepository.existsBy({ companyId: companyId, code: supplierCode });
  return exists;
}

export async function isSupplierNameExists(companyId: string, supplierName: string, supplierId?: string): Promise<boolean> {
  let exists = true;
  if (supplierId) {
    exists = await supplierRepository.exists({
      where: { companyId: companyId, name: supplierName, supplierId: Not(supplierId) }
    });
    return exists;
  }
  exists = await supplierRepository.existsBy({ companyId: companyId, name: supplierName });
  return exists;
}

async function invalidateCache(companyId: string, supplierId?: string): Promise<void> {
  await cache.del(`suppliers_${companyId}`);
  if (supplierId) await cache.del(`suppliers:${supplierId}`);
}
// }
