import express from "express";
import { authentication } from "../middleware";
import { AuthController } from "../controllers";

export const authRoutes = () => {
  const router = express.Router();
  router.post("/register", AuthController.register);
  router.post("/login", AuthController.login);
  router.get("/profile", authentication, AuthController.getProfile);
  // router.post("/logout", authentication, AuthController.logout);
  return router;
};
