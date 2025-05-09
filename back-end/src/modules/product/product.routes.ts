import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { ProductController } from './product.controller';
import { UserRoles } from '../../entities';

export const productRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(ProductController.getProducts)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), ProductController.createProduct);
  router
    .route('/:productId')
    .get(ProductController.getProductById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), ProductController.updateProduct)
    .delete(authorization([UserRoles.Admin, UserRoles.Manager]), ProductController.deleteProduct);
  return router;
};
