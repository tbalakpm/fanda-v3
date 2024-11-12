import { NextFunction, Request, Response } from "express";
import { ApiError } from "../responses/api-error";

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  return next(new ApiError("URL or Method not found", 404));
};
