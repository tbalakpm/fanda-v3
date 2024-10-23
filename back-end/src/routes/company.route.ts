import express from "express";
import { authorization } from "../middleware";
import { CompanyController } from "../controllers";

export const companyRoutes = () => {
  const router = express.Router();
  router
    .route(`/`)
    .get(authorization(["admin"]), CompanyController.getCompanies)
    .post(authorization(["admin"]), CompanyController.createCompany);
  router
    .route(`/:companyId`)
    .get(authorization(["admin"]), CompanyController.getCompanyById)
    .put(authorization(["admin"]), CompanyController.updateCompany)
    .delete(authorization(["admin"]), CompanyController.deleteCompany);
  return router;
};
