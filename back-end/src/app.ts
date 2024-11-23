import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { authentication } from './middleware/authentication.middleware';
import { notFound } from './middleware/not-found.middleware';
import { errorHandler } from './middleware/error.middleware';

import { userRoutes } from './routes/user.route';
import { authRoutes } from './routes/auth.route';
import { companyRoutes } from './routes/company.route';
import { financialYearRoutes } from './modules/financial-year/financial-year.route';
import { unitRoutes } from './modules/unit/unit.route';
import { productCategoryRoutes } from './modules/product-category/product-category.route';
import { productRoutes } from './modules/product/product.route';
import { supplierRoutes } from './modules/supplier/supplier.route';
import { customerRoutes } from './modules/customer/customer.route';
import { consumerRoutes } from './modules/consumer/consumer.route';

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

app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: '*',
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Access-Token', 'X-Refresh-Token', 'X-User-Id'],
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
);
app.use(loggerMiddleware);

// ############### routers - begin ###############
const companyRouter = companyRoutes();

// auth routes
app.use('/api/auth', authRoutes());
app.use(authentication);

// root routes
app.use('/api/users', userRoutes());
app.use('/api/companies', companyRouter);
// company routes
companyRouter.use('/:companyId/years', financialYearRoutes());
companyRouter.use('/:companyId/units', unitRoutes());
companyRouter.use('/:companyId/product-categories', productCategoryRoutes());
companyRouter.use('/:companyId/products', productRoutes());
companyRouter.use('/:companyId/suppliers', supplierRoutes());
companyRouter.use('/:companyId/customers', customerRoutes());
companyRouter.use('/:companyId/consumers', consumerRoutes());
// year routes

// ############### routers - end ###############

app.use(notFound);
app.use(errorHandler);

export default app;
export { app };
