import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { SupplierController } from './supplier.controller';

export const supplierRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(SupplierController.getSuppliers)
    .post(authorization(['admin', 'manager']), SupplierController.createSupplier);
  router
    .route('/:supplierId')
    .get(SupplierController.getSupplierById)
    .put(authorization(['admin', 'manager']), SupplierController.updateSupplier)
    .delete(authorization(['admin', 'manager']), SupplierController.deleteSupplier);
  return router;
};
