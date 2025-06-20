import type { NextFunction, Request, Response } from 'express';

import * as CustomerService from './customer.service';
import type { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

// export class CustomerController {
export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await CustomerService.getAllCustomers(companyId);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getCustomerById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, customerId } = req.params;
    const result = await CustomerService.getCustomerById(companyId, customerId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const result = await CustomerService.createCustomer(companyId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, customerId } = req.params;
    const result = await CustomerService.updateCustomer(companyId, customerId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function deleteCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, customerId } = req.params;
    const result = await CustomerService.deleteCustomer(companyId, customerId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}
// }
