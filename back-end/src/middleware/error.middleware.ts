import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../responses/api-error';
import logger from '../logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const message = `${req.method} ${req.hostname}${req.path} - ${err.message}`;
  if (err instanceof ApiError) {
    if (err.statusCode >= 400 && err.statusCode < 500) {
      logger.warn(message, { stack: err.stack });
    } else {
      logger.error(message, { stack: err.stack });
    }
    res.status(err.statusCode).json({ message: err.message });
  } else {
    logger.error(message, { stack: err.stack });
    res.status(500).json({ message: 'Internal server error' });
  }

  next();
};
