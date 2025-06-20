import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import * as ConsumerController from './consumer.controller';
import { UserRoles } from '../../entities';

export const consumerRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(ConsumerController.getAllConsumers)
    .post(authorization([UserRoles.Admin, UserRoles.Manager]), ConsumerController.createConsumer);
  router
    .route('/:consumerId')
    .get(ConsumerController.getConsumerById)
    .put(authorization([UserRoles.Admin, UserRoles.Manager]), ConsumerController.updateConsumer)
    .delete(authorization([UserRoles.Admin, UserRoles.Manager]), ConsumerController.deleteConsumer);
  return router;
};
