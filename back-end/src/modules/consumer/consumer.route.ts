import express from 'express';
import { authorization } from '../../middleware/authorization.middleware';
import { ConsumerController } from './consumer.controller';

export const consumerRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route('/')
    .get(ConsumerController.getAllConsumers)
    .post(authorization(['admin', 'manager']), ConsumerController.createConsumer);
  router
    .route('/:consumerId')
    .get(ConsumerController.getConsumerById)
    .put(authorization(['admin', 'manager']), ConsumerController.updateConsumer)
    .delete(authorization(['admin', 'manager']), ConsumerController.deleteConsumer);
  return router;
};
