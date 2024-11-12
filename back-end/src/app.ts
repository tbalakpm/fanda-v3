import "reflect-metadata";
import express from "express";
import cors from "cors";

// import { authentication, notFound, errorHandler, loggerMiddleware } from "./middleware";
// import { authRoutes, userRoutes, companyRoutes } from "./routes";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { authentication } from "./middleware/authentication.middleware";
import { notFound } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";

import { userRoutes } from "./routes/user.route";
import { companyRoutes } from "./routes/company.route";
import { financialYearRoutes } from "./modules/financial-year/financial-year.route";
import { unitRoutes } from "./modules/unit/unit.route";
import { productCategoryRoutes } from "./modules/product-category/product-category.route";
import { productRoutes } from "./modules/product/product.route";
import { supplierRoutes } from "./modules/supplier/supplier.route";
import { customerRoutes } from "./modules/customer/customer.route";
import { authRoutes } from "./routes/auth.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors({ origin: "*" }));
app.use(loggerMiddleware);

// ############### routers - begin ###############
const companyRouter = companyRoutes();

// auth routes
app.use("/api/auth", authRoutes());
app.use(authentication);

// root routes
app.use("/api/users", userRoutes());
app.use("/api/companies", companyRouter);
// company routes
companyRouter.use("/:companyId/years", financialYearRoutes());
companyRouter.use("/:companyId/units", unitRoutes());
companyRouter.use("/:companyId/product-categories", productCategoryRoutes());
companyRouter.use("/:companyId/products", productRoutes());
companyRouter.use("/:companyId/suppliers", supplierRoutes());
companyRouter.use("/:companyId/customers", customerRoutes());
// year routes

// ############### routers - end ###############

app.use(notFound);
app.use(errorHandler);

export default app;
export { app };
