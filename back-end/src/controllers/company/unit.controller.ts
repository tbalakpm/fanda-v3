import { NextFunction, Request, Response } from "express";
import { UnitService } from "../../services";
import { User } from "../../entities";
import { ApiError } from "../../responses/api-error";

export class UnitController {
  static async getUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await UnitService.getAllUnits(companyId);
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getUnitById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, unitId } = req.params;
      const result = await UnitService.getUnitById(companyId, unitId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await UnitService.createUnit(companyId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, unitId } = req.params;
      // console.log(unitId, req.body);
      // const { code, name, description } = req.body;
      // const updatedCompany = { code, name, description } as Unit;
      const result = await UnitService.updateUnit(companyId, unitId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, unitId } = req.params;
      const result = await UnitService.deleteUnit(companyId, unitId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
