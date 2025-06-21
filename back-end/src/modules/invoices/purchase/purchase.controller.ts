import type { NextFunction, Request, Response } from 'express';

import * as PurchaseService from './purchase.service';
import type { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import type { Purchase } from './purchase.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';

export async function getAllPurchases(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const getAllQuery: GetAllQuery = req.query;
    const result = await PurchaseService.getAllPurchases(companyId, yearId, getAllQuery);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getPurchaseById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;

    const result = await PurchaseService.getPurchaseById(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createPurchase(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;

    const result = await PurchaseService.createPurchase(companyId, yearId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updatePurchase(req: Request, res: Response, next: NextFunction) {
  try {
    const result = new ApiResponse<Purchase>();
    result.status = ApiStatus.NOT_IMPLEMENTED;
    res.status(result.status).json({ success: true, message: 'Not implemented yet' });
  } catch (error) {
    return next(error);
  }
}

export async function deletePurchase(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;
    const result = await PurchaseService.deletePurchase(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }

    res.status(result.status).json({ success: result.success, message: result.message });
  } catch (error) {
    return next(error);
  }
}
