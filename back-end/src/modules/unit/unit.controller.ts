import type { NextFunction, Request, Response } from 'express';

import * as UnitService from './unit.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

// export class UnitController {
export async function getUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await UnitService.getAllUnits(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getUnitById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, unitId } = req.params;
    const result = await UnitService.getUnitById(companyId, unitId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await UnitService.createUnit(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, unitId } = req.params;
    const result = await UnitService.updateUnit(companyId, unitId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, unitId } = req.params;
    const result = await UnitService.deleteUnit(companyId, unitId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
// }
