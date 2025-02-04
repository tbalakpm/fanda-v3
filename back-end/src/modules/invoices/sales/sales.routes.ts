import express from 'express';
import { authorization } from '../../../middleware/authorization.middleware';
import { SalesController } from './sales.controller';
import { UserRoles } from '../../../entities';

export const salesRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(SalesController.getAllSales)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), SalesController.createSales);
  router
    .route('/:invoiceId')
    .get(SalesController.getSalesById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), SalesController.updateSales)
    .delete(authorization([UserRoles.Admin]), SalesController.deleteSales);
  return router;
};
