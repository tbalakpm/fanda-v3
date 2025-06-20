import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import * as FinancialYearController from './financial-year.controller';
import { UserRoles } from '../../entities';

export const financialYearRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(FinancialYearController.getYears)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), FinancialYearController.createYear);
  router
    .route('/:yearId')
    .get(FinancialYearController.getYearById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), FinancialYearController.updateYear)
    .delete(authorization([UserRoles.Admin]), FinancialYearController.deleteYear);
  return router;
};
