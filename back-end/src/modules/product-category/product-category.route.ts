import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { ProductCategoryController } from './product-category.controller';
import { UserRoles } from '../../entities';

export const productCategoryRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(ProductCategoryController.getCategories)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), ProductCategoryController.createCategory);
  router
    .route('/:categoryId')
    .get(ProductCategoryController.getCategoryById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), ProductCategoryController.updateCategory)
    .delete(authorization([UserRoles.Admin, UserRoles.Manager]), ProductCategoryController.deleteCategory);
  return router;
};
