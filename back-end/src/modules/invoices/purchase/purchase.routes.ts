import express from 'express';
import { authorization } from '../../../middleware/authorization.middleware';
import * as PurchaseController from './purchase.controller';
import { UserRoles } from '../../../entities';

export const purchaseRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(PurchaseController.getAllPurchases)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), PurchaseController.createPurchase);
  router
    .route('/:invoiceId')
    .get(PurchaseController.getPurchaseById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), PurchaseController.updatePurchase)
    .delete(authorization([UserRoles.Admin]), PurchaseController.deletePurchase);
  return router;
};
