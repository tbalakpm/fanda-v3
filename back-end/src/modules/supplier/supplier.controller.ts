import type { NextFunction, Request, Response } from 'express';

import * as SupplierService from './supplier.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

export async function getSuppliers(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await SupplierService.getAllSuppliers(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getSupplierById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, supplierId } = req.params;
    const result = await SupplierService.getSupplierById(companyId, supplierId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await SupplierService.createSupplier(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, supplierId } = req.params;
    const result = await SupplierService.updateSupplier(companyId, supplierId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, supplierId } = req.params;
    const result = await SupplierService.deleteSupplier(companyId, supplierId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
