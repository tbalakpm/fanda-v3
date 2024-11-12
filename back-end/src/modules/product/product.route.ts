import express from "express";
import { authorization } from "../../middleware/authorization.middleware";
import { ProductController } from "./product.controller";

export const productRoutes = () => {
  const router = express.Router({ mergeParams: true });

  router
    .route("/")
    .get(ProductController.getProducts)
    .post(authorization(["admin", "manager"]), ProductController.createProduct);
  router
    .route("/:productId")
    .get(ProductController.getProductById)
    .put(authorization(["admin", "manager"]), ProductController.updateProduct)
    .delete(authorization(["admin", "manager"]), ProductController.deleteProduct);
  return router;
};
