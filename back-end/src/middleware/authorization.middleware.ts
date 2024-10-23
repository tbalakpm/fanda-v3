import { NextFunction, Request, Response } from "express";
import { User } from "../entities";
import { ApiError } from "../responses/api-error";

export const authorization = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.currentUser as User; //await UserService.getUserById(req['currentUser'].id);
    if (!user || !roles.includes(user.role)) {
      return next(new ApiError("Forbidden", 403));
    }
    next();
  };
};
