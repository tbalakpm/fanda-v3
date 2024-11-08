import { NextFunction, Request, Response } from "express";

import { ProductCategoryService } from "./product-category.service";
import { User } from "../../entities";
import { ApiError } from "../../responses";

export class ProductCategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await ProductCategoryService.getAllCategories(companyId);
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, categoryId } = req.params;
      const result = await ProductCategoryService.getCategoryById(companyId, categoryId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await ProductCategoryService.createCategory(companyId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, categoryId } = req.params;
      const result = await ProductCategoryService.updateCategory(companyId, categoryId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, categoryId } = req.params;
      const result = await ProductCategoryService.deleteCategory(companyId, categoryId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
