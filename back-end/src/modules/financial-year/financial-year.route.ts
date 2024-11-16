import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { FinancialYearController } from './financial-year.controller';

export const financialYearRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(FinancialYearController.getYears)
    .post(authorization(['admin', 'manager']), FinancialYearController.createYear);
  router
    .route('/:yearId')
    .get(FinancialYearController.getYearById)
    .put(authorization(['admin', 'manager']), FinancialYearController.updateYear)
    .delete(authorization(['admin']), FinancialYearController.deleteYear);
  return router;
};
