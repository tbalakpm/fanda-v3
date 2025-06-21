import type { NextFunction, Request, Response } from 'express';

import * as UserService from '../services/user.service';
import { ApiError } from '../responses/api-error';
import { ApiStatus } from '../responses';

export async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await UserService.getAllUsers();
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
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

export async function createUser(req: Request, res: Response, next: NextFunction) {
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

export async function updateUser(req: Request, res: Response, next: NextFunction) {
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

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
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

export async function exists(req: Request, res: Response, next: NextFunction) {
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

export async function dashboard(req: Request, res: Response, next: NextFunction) {
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
