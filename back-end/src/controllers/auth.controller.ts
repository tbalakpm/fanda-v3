import type { NextFunction, Request, Response } from 'express';

import { LoginDto } from '../dto/login.dto';
import { ApiError } from '../responses/api-error';
import * as AuthService from '../services/auth.service';
import * as UserService from '../services/user.service';
import { ApiStatus } from '../responses';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new ApiError('Username and password are required', ApiStatus.BAD_REQUEST));
    }

    const result = await AuthService.register(req.body);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new ApiError('Username and password are required', 400));
    }

    const login = new LoginDto(username, password);
    const result = await AuthService.login(login);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.currentUser) {
      return next(new ApiError('Unauthorized', 401));
    }

    const result = await UserService.getUserById(req.currentUser.userId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
