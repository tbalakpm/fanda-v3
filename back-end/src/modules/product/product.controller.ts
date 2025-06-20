import type { NextFunction, Request, Response } from 'express';

import * as ProductService from './product.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

// export class ProductController {
export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await ProductService.getAllProducts(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, productId } = req.params;
    const result = await ProductService.getProductById(companyId, productId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await ProductService.createProduct(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, productId } = req.params;
    const result = await ProductService.updateProduct(companyId, productId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, productId } = req.params;
    const result = await ProductService.deleteProduct(companyId, productId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
// }
