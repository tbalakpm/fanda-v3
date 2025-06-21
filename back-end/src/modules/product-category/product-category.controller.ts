import type { NextFunction, Request, Response } from 'express';

import * as ProductCategoryService from './product-category.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await ProductCategoryService.getAllCategories(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, categoryId } = req.params;
    const result = await ProductCategoryService.getCategoryById(companyId, categoryId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await ProductCategoryService.createCategory(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, categoryId } = req.params;
    const result = await ProductCategoryService.updateCategory(companyId, categoryId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, categoryId } = req.params;
    const result = await ProductCategoryService.deleteCategory(companyId, categoryId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
