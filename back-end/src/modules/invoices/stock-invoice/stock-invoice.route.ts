import express from 'express';
import { authorization } from '../../../middleware/authorization.middleware';
import { StockInvoiceController } from './stock-invoice.controller';
import { UserRoles } from '../../../entities';

export const stockInvoiceRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(StockInvoiceController.getAllStockInvoices)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), StockInvoiceController.createStockInvoice);
  router
    .route('/:invoiceId')
    .get(StockInvoiceController.getStockInvoiceById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), StockInvoiceController.updateStockInvoice)
    .delete(authorization([UserRoles.Admin]), StockInvoiceController.deleteStockInvoice);
  return router;
};
