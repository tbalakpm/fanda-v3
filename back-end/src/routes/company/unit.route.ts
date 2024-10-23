import express from "express";
import { authorization } from "../../middleware";
import { UnitController } from "../../controllers";

export const unitRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route(`/`)
    .get(authorization(["admin"]), UnitController.getUnits)
    .post(authorization(["admin"]), UnitController.createUnit);
  router
    .route(`/:id`)
    .get(authorization(["admin"]), UnitController.getUnitById)
    .put(authorization(["admin"]), UnitController.updateUnit)
    .delete(authorization(["admin"]), UnitController.deleteUnit);
  return router;
};
