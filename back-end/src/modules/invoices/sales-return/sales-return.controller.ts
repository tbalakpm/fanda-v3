import type { NextFunction, Request, Response } from 'express';

import * as ReturnService from './sales-return.service';
import type { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import type { SalesReturn } from './sales-return.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';

export async function getAllReturns(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const getAllQuery: GetAllQuery = req.query;
    const result = await ReturnService.getAllReturns(companyId, yearId, getAllQuery);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getReturnById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;

    const result = await ReturnService.getReturnById(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;

    const result = await ReturnService.createReturn(companyId, yearId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = new ApiResponse<SalesReturn>();
    result.status = ApiStatus.NOT_IMPLEMENTED;
    res.status(result.status).json({ success: true, message: 'Not implemented yet' });
  } catch (error) {
    return next(error);
  }
}

export async function deleteReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;
    const result = await ReturnService.deleteReturn(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }

    res.status(result.status).json({ success: result.success, message: result.message });
  } catch (error) {
    return next(error);
  }
}
