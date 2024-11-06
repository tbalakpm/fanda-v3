import "reflect-metadata";
import express from "express";
import cors from "cors";

import { authentication, notFound, errorHandler, loggerMiddleware } from "./middleware";
import { authRoutes, userRoutes, companyRoutes, unitRoutes, yearRoutes } from "./routes";

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
companyRouter.use("/:companyId/units", unitRoutes());
companyRouter.use("/:companyId/years", yearRoutes());
// app.use("/api/companies/:companyId/years", yearRoutes(companyRouter));
// year routes

// ############### routers - end ###############

app.use(notFound);
app.use(errorHandler);

export default app;
export { app };
