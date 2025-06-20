import type { NextFunction, Request, Response } from 'express';
// import { User } from "../entities";
import { ApiError } from '../responses/api-error';
import type { User } from '../entities/user.entity';

export const authorization = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.currentUser as User;
    if (!user || !roles.includes(user.role)) {
      return next(new ApiError('Forbidden', 403));
    }
    next();
  };
};
