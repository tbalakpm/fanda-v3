import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import * as UnitController from './unit.controller';
import { UserRoles } from '../../entities';

export const unitRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(UnitController.getUnits)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), UnitController.createUnit);
  router
    .route('/:unitId')
    .get(UnitController.getUnitById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), UnitController.updateUnit)
    .delete(authorization([UserRoles.Admin, UserRoles.Manager]), UnitController.deleteUnit);
  return router;
};
