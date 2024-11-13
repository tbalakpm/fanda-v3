import { NextFunction, Request, Response } from "express";
// import process from "node:process";
import logger from "../logger";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  const requestPath = req.path;
  res.on("finish", () => {
    const totalTime = process.hrtime(startTime);
    const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;
    // res.setHeader("X-Response-Time", `${totalTimeInMs.toFixed(3)}ms`);
    res.timeTakenMs = totalTimeInMs;
    const timeTakenString = `${totalTimeInMs.toFixed(3)} ms`;
    const responseSizeString = `${res.getHeaders()["content-length"]} bytes`;

    if (res.statusCode >= 200 && res.statusCode < 400) {
      logger.info(`${req.method} ${req.hostname}${requestPath} - ${res.statusCode} - ${timeTakenString} - ${responseSizeString}`);
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn(`${req.method} ${req.hostname}${requestPath} - ${res.statusCode} - ${timeTakenString} - ${responseSizeString}`);
    } else if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.hostname}${requestPath} - ${res.statusCode} - ${timeTakenString} - ${responseSizeString}`);
    }
  });

  next();
};

// export default loggerMiddleware;
