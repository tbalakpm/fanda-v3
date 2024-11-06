import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { UserService } from "../services";
import { User } from "../entities";
import { ApiError } from "../responses/api-error";

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return next(new ApiError("Unauthorized: Missing authorization header", 401));
    }
    const token = header.split(" ")[1];
    if (!token) {
      return next(new ApiError("Unauthorized: Invalid authorization header", 401));
    }
    const jwtPayload = jwt.verify(token, process.env.JWT_SECRET || "");
    if (!jwtPayload) {
      return next(new ApiError("Unauthorized: Invalid token", 401));
    }
    //req.jwtPayload = jwtPayload;
    const result = await UserService.getUserById((jwtPayload as jwt.JwtPayload)?.userId || "");
    if (!result.success) {
      return next(new ApiError("Unauthorized: User not found", 401));
    }
    req.currentUser = result.data as User;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new ApiError("Unauthorized: Token expired or invalid token", 401));
    }
    return next(err);
  }
};
