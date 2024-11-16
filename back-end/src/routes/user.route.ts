import express from 'express';
import { authorization } from '../middleware/authorization.middleware';
import { UserController } from '../controllers/user.controller';
// import { authorization } from "../middleware";
// import { UserController } from "../controllers";

export const userRoutes = () => {
  const router = express.Router();
  router
    .route('/')
    .get(authorization(['admin']), UserController.getUsers)
    .post(authorization(['admin']), UserController.createUser);
  router
    .route('/:userId')
    .get(authorization(['admin']), UserController.getUserById)
    .put(authorization(['admin']), UserController.updateUser)
    .delete(authorization(['admin']), UserController.deleteUser);
  return router;
};
