import type { NextFunction, Request, Response } from 'express';

import * as ConsumerService from './consumer.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

export async function getAllConsumers(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await ConsumerService.getAllConsumers(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getConsumerById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, consumerId } = req.params;
    const result = await ConsumerService.getConsumerById(companyId, consumerId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createConsumer(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await ConsumerService.createConsumer(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateConsumer(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, consumerId } = req.params;
    const result = await ConsumerService.updateConsumer(companyId, consumerId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteConsumer(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, consumerId } = req.params;
    const result = await ConsumerService.deleteConsumer(companyId, consumerId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
