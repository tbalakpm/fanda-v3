import express from 'express';
import inventoryController from './inventory.controller';

export const inventoryRoutes = () => {
  const router = express.Router({ mergeParams: true });
  router.route('/gtn/:gtn').post(inventoryController.searchGtn);

  return router;
};
