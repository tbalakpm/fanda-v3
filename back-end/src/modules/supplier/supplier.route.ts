import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { SupplierController } from './supplier.controller';
import { UserRoles } from '../../entities';

export const supplierRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(SupplierController.getSuppliers)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), SupplierController.createSupplier);
  router
    .route('/:supplierId')
    .get(SupplierController.getSupplierById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), SupplierController.updateSupplier)
    .delete(authorization([UserRoles.Admin, UserRoles.Manager]), SupplierController.deleteSupplier);
  return router;
};
