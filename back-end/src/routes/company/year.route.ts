import express from "express";
import { authorization } from "../../middleware";
import { YearController } from "../../controllers";

export const yearRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route(`/`)
    .get(authorization(["admin"]), YearController.getYears)
    .post(authorization(["admin"]), YearController.createYear);
  router
    .route(`/:yearId`)
    .get(authorization(["admin"]), YearController.getYearById)
    .put(authorization(["admin"]), YearController.updateYear)
    .delete(authorization(["admin"]), YearController.deleteYear);
  return router;
};
