import { NextFunction, Request, Response } from "express";

import { UserService } from "../services";
import { ApiError } from "../responses";

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.getAllUsers();
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await UserService.getUserById(userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.createUser(req.body);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await UserService.updateUser(userId, req.body);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await UserService.deleteUser(userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
