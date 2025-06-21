import type { NextFunction, Request, Response } from 'express';

import * as PurchaseReturnService from './purchase-return.service';
import type { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import type { PurchaseReturn } from './purchase-return.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';

export async function getAllPurchaseReturns(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const getAllQuery: GetAllQuery = req.query;
    const result = await PurchaseReturnService.getAllPurchaseReturns(companyId, yearId, getAllQuery);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getPurchaseReturnById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;

    const result = await PurchaseReturnService.getPurchaseReturnById(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createPurchaseReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;

    const result = await PurchaseReturnService.createPurchaseReturn(companyId, yearId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updatePurchaseReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = new ApiResponse<PurchaseReturn>();
    result.status = ApiStatus.NOT_IMPLEMENTED;
    res.status(result.status).json({ success: true, message: 'Not implemented yet' });
  } catch (error) {
    return next(error);
  }
}

export async function deletePurchaseReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;
    const result = await PurchaseReturnService.deletePurchaseReturn(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }

    res.status(result.status).json({ success: result.success, message: result.message });
  } catch (error) {
    return next(error);
  }
}
