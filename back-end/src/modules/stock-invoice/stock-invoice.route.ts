import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { StockInvoiceController } from './stock-invoice.controller';

export const stockInvoiceRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(StockInvoiceController.getStockInvoices)
    .post(authorization(['admin', 'manager']), StockInvoiceController.createStockInvoice);
  router
    .route('/:yearId')
    .get(StockInvoiceController.getStockInvoiceById)
    .put(authorization(['admin', 'manager']), StockInvoiceController.updateStockInvoice)
    .delete(authorization(['admin']), StockInvoiceController.deleteStockInvoice);
  return router;
};
