import express from "express";
import { authorization } from "../../middleware/authorization.middleware";
import { UnitController } from "./unit.controller";

export const unitRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route("/")
    .get(UnitController.getUnits)
    .post(authorization(["admin", "manager"]), UnitController.createUnit);
  router
    .route("/:unitId")
    .get(UnitController.getUnitById)
    .put(authorization(["admin", "manager"]), UnitController.updateUnit)
    .delete(authorization(["admin", "manager"]), UnitController.deleteUnit);
  return router;
};
