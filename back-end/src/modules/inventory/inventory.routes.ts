import express from 'express';
import * as InventoryController from './inventory.controller';

export const inventoryRoutes = () => {
  const router = express.Router({ mergeParams: true });
  router.route('/gtn/:gtn').get(InventoryController.searchGtn);

  return router;
};
