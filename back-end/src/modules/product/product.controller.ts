import { NextFunction, Request, Response } from "express";

import { ProductService } from "./product.service";
import { User } from "../../entities/user.entity";
import { ApiError } from "../../responses/api-error";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await ProductService.getAllProducts(companyId);
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, productId } = req.params;
      const result = await ProductService.getProductById(companyId, productId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await ProductService.createProduct(companyId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, productId } = req.params;
      const result = await ProductService.updateProduct(companyId, productId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, productId } = req.params;
      const result = await ProductService.deleteProduct(companyId, productId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
