import express from 'express';
import { authorization } from '../../../middleware/authorization.middleware';
import { SalesReturnController } from './sales-return.controller';
import { UserRoles } from '../../../entities';

export const salesReturnRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(SalesReturnController.getAllReturns)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), SalesReturnController.createReturn);
  router
    .route('/:invoiceId')
    .get(SalesReturnController.getReturnById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), SalesReturnController.updateReturn)
    .delete(authorization([UserRoles.Admin]), SalesReturnController.deleteReturn);
  return router;
};
