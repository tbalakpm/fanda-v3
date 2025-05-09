import { NextFunction, Request, Response } from 'express';

import { UserService } from '../services/user.service';
import { ApiError } from '../responses/api-error';
import { ApiStatus } from '../responses';

export class UserController {
  static async getUsers(_req: Request, res: Response, next: NextFunction) {
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

  static async exists(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email } = req.query;
      const result = await UserService.checkExists(username as string, email as string);
      if (!result.success) {
        return next(new ApiError('Failed to check existence of username/email', ApiStatus.INTERNAL_SERVER_ERROR));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.dashboard();
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
