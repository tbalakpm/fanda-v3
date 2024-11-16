import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { ProductCategoryController } from './product-category.controller';

export const productCategoryRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(ProductCategoryController.getCategories)
    .post(authorization(['admin', 'manager']), ProductCategoryController.createCategory);
  router
    .route('/:categoryId')
    .get(ProductCategoryController.getCategoryById)
    .put(authorization(['admin', 'manager']), ProductCategoryController.updateCategory)
    .delete(authorization(['admin', 'manager']), ProductCategoryController.deleteCategory);
  return router;
};
