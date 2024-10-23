import { Router } from "express";
import { authorization } from "../../middleware";
import { CompanyController } from "../../controllers";

export const yearRoutes = (prefix: string, router: Router) => {
  router
    .route(`/${prefix}`)
    .get(authorization(["admin"]), CompanyController.getCompanies)
    .post(authorization(["admin"]), CompanyController.createCompany);
  router
    .route(`/${prefix}/:companyId`)
    .get(authorization(["admin"]), CompanyController.getCompanyById)
    .put(authorization(["admin"]), CompanyController.updateCompany)
    .delete(authorization(["admin"]), CompanyController.deleteCompany);
  return router;
};
