import { NextFunction, Request, Response } from "express";
import { UnitService } from "../../services";
import { Unit, User } from "../../entities";
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
      const { id } = req.params;
      const result = await UnitService.getUnitById(id);
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
      const result = await UnitService.createUnit(
        companyId,
        req.body,
        (req.currentUser as User).id
      );
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
      const { id } = req.params;
      const { code, name, description } = req.body;
      const updatedCompany = { code, name, description } as Unit;
      const result = await UnitService.updateUnit(id, updatedCompany, (req.currentUser as User).id);
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
      const { id } = req.params;
      const result = await UnitService.deleteUnit(id);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
