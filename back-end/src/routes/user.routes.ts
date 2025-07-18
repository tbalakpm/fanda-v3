import express from 'express';
import { authorization } from '../middleware/authorization.middleware';
import * as UserController from '../controllers/user.controller';
import { UserRoles } from '../entities';

export const userRoutes = () => {
  const router = express.Router();
  router.route('/dashboard').get(UserController.dashboard);
  router.route('/exists').get(UserController.exists);
  router
    .route('/')
    .get(authorization([UserRoles.Admin]), UserController.getUsers)
    .post(authorization([UserRoles.Admin]), UserController.createUser);
  router
    .route('/:userId')
    .get(authorization([UserRoles.Admin]), UserController.getUserById)
    .put(authorization([UserRoles.Admin]), UserController.updateUser)
    .delete(authorization([UserRoles.Admin]), UserController.deleteUser);
  return router;
};
