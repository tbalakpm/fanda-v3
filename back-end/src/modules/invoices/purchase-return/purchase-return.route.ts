import express from 'express';
import { authorization } from '../../../middleware/authorization.middleware';
import { PurchaseReturnController } from './purchase-return.controller';
import { UserRoles } from '../../../entities';

export const purchaseReturnRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(PurchaseReturnController.getAllPurchaseReturns)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), PurchaseReturnController.createPurchaseReturn);
  router
    .route('/:invoiceId')
    .get(PurchaseReturnController.getPurchaseReturnById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), PurchaseReturnController.updatePurchaseReturn)
    .delete(authorization([UserRoles.Admin]), PurchaseReturnController.deletePurchaseReturn);
  return router;
};
