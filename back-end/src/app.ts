import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { loggerMiddleware } from './middleware/logger.middleware';
import { authentication } from './middleware/authentication.middleware';
import { notFound } from './middleware/not-found.middleware';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';
import { actionHeader } from './middleware/custom-header.middleware';

import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import { companyRoutes } from './routes/company.routes';
import { financialYearRoutes } from './modules/financial-year/financial-year.routes';
import { unitRoutes } from './modules/unit/unit.routes';
import { productCategoryRoutes } from './modules/product-category/product-category.routes';
import { productRoutes } from './modules/product/product.routes';
import { supplierRoutes } from './modules/supplier/supplier.routes';
import { customerRoutes } from './modules/customer/customer.routes';
import { consumerRoutes } from './modules/consumer/consumer.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';

import { stockInvoiceRoutes } from './modules/invoices/stock-invoice/stock-invoice.routes';
import { purchaseRoutes } from './modules/invoices/purchase/purchase.routes';
import { salesRoutes } from './modules/invoices/sales/sales.routes';
import { salesReturnRoutes } from './modules/invoices/sales-return/sales-return.routes';
import { purchaseReturnRoutes } from './modules/invoices/purchase-return/purchase-return.routes';

const app = express();

// Allow any method from any host and log requests
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE");
//   if ("OPTIONS" === req.method) {
//     res.sendStatus(200);
//   } else {
//     console.log(`${req.ip} ${req.method} ${req.url}`);
//     next();
//   }
// });

const whitelist = process.env.CORS_ORIGINS.split(';');

app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin) {
        return callback(null, true);
      }
      if (whitelist.indexOf(requestOrigin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Access-Token',
      'X-Refresh-Token',
      'X-User-Id',
      'X-Forwarded-For',
      'X-Forwarded-Host',
      'X-Forwarded-Proto',
      'X-Action'
    ],
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
);
app.use(loggerMiddleware);
app.use(rateLimiter);

// ############### routers - begin ###############
const companyRouter = companyRoutes();
const yearRouter = financialYearRoutes();

// auth routes
app.use('/api/auth', authRoutes());
app.use(authentication);
app.use(actionHeader);

// root routes
app.use('/api/users', userRoutes());
app.use('/api/companies', companyRouter);
// company routes
companyRouter.use('/:companyId/years', yearRouter);
companyRouter.use('/:companyId/units', unitRoutes());
companyRouter.use('/:companyId/product-categories', productCategoryRoutes());
companyRouter.use('/:companyId/products', productRoutes());
companyRouter.use('/:companyId/suppliers', supplierRoutes());
companyRouter.use('/:companyId/customers', customerRoutes());
companyRouter.use('/:companyId/consumers', consumerRoutes());
companyRouter.use('/:companyId/inventories', inventoryRoutes());
// year routes
yearRouter.use('/:yearId/stock-invoices', stockInvoiceRoutes());
yearRouter.use('/:yearId/purchases', purchaseRoutes());
yearRouter.use('/:yearId/sales', salesRoutes());
yearRouter.use('/:yearId/sales-returns', salesReturnRoutes());
yearRouter.use('/:yearId/purchase-returns', purchaseReturnRoutes());

// ############### routers - end ###############

app.use(notFound);
app.use(errorHandler);

export default app;
export { app };
