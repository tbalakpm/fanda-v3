import type { NextFunction, Request, Response } from 'express';
import logger from '../logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  const requestPath = req.path;
  logger.info(`<-- ${req.method} ${req.path} - ${req.ip} - ${req.get('user-agent')} - ${req.get('content-length') || 0} bytes`);
  next();

  res.on('finish', () => {
    const totalTime = process.hrtime(startTime);
    const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;
    // res.setHeader("X-Response-Time", `${totalTimeInMs.toFixed(3)}ms`);
    res.timeTakenMs = totalTimeInMs;
    const timeTakenString = `${totalTimeInMs.toFixed(3)} ms`;
    const responseSizeString = `${res.getHeaders()['content-length'] || 0} bytes`;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      logger.info(`--> ${req.method} ${requestPath} - ${res.statusCode} - ${timeTakenString} - ${responseSizeString}`);
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      logger.info(`--> ${req.method} ${requestPath} - ${res.statusCode} - ${timeTakenString}`);
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn(`--> ${req.method} ${requestPath} - ${res.statusCode} - ${timeTakenString} - ${responseSizeString}`);
    } else if (res.statusCode >= 500) {
      logger.error(`--> ${req.method} ${requestPath} - ${res.statusCode} - ${timeTakenString} - ${responseSizeString}`);
    }
  });
};
