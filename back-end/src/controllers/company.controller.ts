import { NextFunction, Request, Response } from 'express';

import { CompanyService } from '../services/company.service';
import { User } from '../entities/user.entity';
import { ApiError } from '../responses/api-error';

export class CompanyController {
  static async getCompanies(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CompanyService.getAllCompanies();
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getCompanyById(req: Request, res: Response, next: NextFunction) {
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

  static async createCompany(req: Request, res: Response, next: NextFunction) {
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

  static async updateCompany(req: Request, res: Response, next: NextFunction) {
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

  static async deleteCompany(req: Request, res: Response, next: NextFunction) {
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
}
