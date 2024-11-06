import express from "express";
import { authorization } from "../../middleware";
import { YearController } from "./year.controller";

export const yearRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route(`/`)
    .get(YearController.getYears)
    .post(authorization(["admin", "manager"]), YearController.createYear);
  router
    .route(`/:yearId`)
    .get(YearController.getYearById)
    .put(authorization(["admin", "manager"]), YearController.updateYear)
    .delete(authorization(["admin"]), YearController.deleteYear);
  return router;
};
