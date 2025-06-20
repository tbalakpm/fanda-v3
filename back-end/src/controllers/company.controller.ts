import type { NextFunction, Request, Response } from 'express';

import * as CompanyService from '../services/company.service';
import type { User } from '../entities/user.entity';
import { ApiError } from '../responses/api-error';

// export class CompanyController {
export async function getCompanies(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await CompanyService.getAllCompanies();
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getCompanyById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await CompanyService.getCompanyById(companyId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }

    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await CompanyService.createCompany(req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }

    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await CompanyService.updateCompany(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }

    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await CompanyService.deleteCompany(companyId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }

    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
// }
