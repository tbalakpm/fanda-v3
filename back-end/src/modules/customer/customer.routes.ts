import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import * as CustomerController from './customer.controller';
import { UserRoles } from '../../entities';

export const customerRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(CustomerController.getCustomers)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), CustomerController.createCustomer);
  router
    .route('/:customerId')
    .get(CustomerController.getCustomerById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), CustomerController.updateCustomer)
    .delete(authorization([UserRoles.Admin, UserRoles.Manager]), CustomerController.deleteCustomer);
  return router;
};
