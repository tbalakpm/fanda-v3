import type { NextFunction, Request, Response } from 'express';

export const actionHeader = (req: Request, res: Response, next: NextFunction) => {
  switch (req.method) {
    case 'POST':
      res.header('X-Action', 'Create');
      break;
    case 'PUT':
    case 'PATCH':
      res.header('X-Action', 'Update');
      break;
    case 'DELETE':
      res.header('X-Action', 'Delete');
      break;
    default:
      break;
  }
  res.header('Access-Control-Expose-Headers', 'X-Action');
  next();
};
