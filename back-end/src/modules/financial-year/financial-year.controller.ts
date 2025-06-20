import type { NextFunction, Request, Response } from 'express';

import * as FinancialYearService from './financial-year.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

// export class FinancialYearController {
export async function getYears(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await FinancialYearService.getAllYears(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getYearById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const result = await FinancialYearService.getYearById(companyId, yearId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createYear(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await FinancialYearService.createYear(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateYear(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const result = await FinancialYearService.updateYear(companyId, yearId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteYear(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const result = await FinancialYearService.deleteYear(companyId, yearId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
// }
