import { NextFunction, Request, Response } from "express";

import { FinancialYearService } from "./financial-year.service";
import { User } from "../../entities";
import { ApiError } from "../../responses";

export class FinancialYearController {
  static async getYears(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await FinancialYearService.getAllYears(companyId);
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getYearById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      const result = await FinancialYearService.getYearById(companyId, yearId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await FinancialYearService.createYear(companyId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      const result = await FinancialYearService.updateYear(companyId, yearId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      const result = await FinancialYearService.deleteYear(companyId, yearId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
