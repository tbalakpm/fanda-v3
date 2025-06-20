import express from 'express';
import { authorization } from '../middleware/authorization.middleware';
import * as CompanyController from '../controllers/company.controller';
import { UserRoles } from '../entities';

export const companyRoutes = () => {
  const router = express.Router();
  router
    .route('/')
    .get(authorization([UserRoles.Admin]), CompanyController.getCompanies)
    .post(authorization([UserRoles.Admin]), CompanyController.createCompany);
  router
    .route('/:companyId')
    .get(authorization([UserRoles.Admin]), CompanyController.getCompanyById)
    .put(authorization([UserRoles.Admin]), CompanyController.updateCompany)
    .delete(authorization([UserRoles.Admin]), CompanyController.deleteCompany);
  return router;
};
