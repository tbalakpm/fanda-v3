import express from "express";
import { authorization } from "../../middleware";
import { CustomerController } from "./customer.controller";

export const customerRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route(`/`)
    .get(CustomerController.getCustomers)
    .post(authorization(["admin", "manager"]), CustomerController.createCustomer);
  router
    .route(`/:customerId`)
    .get(CustomerController.getCustomerById)
    .put(authorization(["admin", "manager"]), CustomerController.updateCustomer)
    .delete(authorization(["admin", "manager"]), CustomerController.deleteCustomer);
  return router;
};
