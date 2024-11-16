import { NextFunction, Request, Response } from 'express';

import { CustomerService } from './customer.service';
import { User } from '../../entities/user.entity';
import { ApiError } from '../../responses/api-error';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await CustomerService.getAllCustomers(companyId);
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, customerId } = req.params;
      const result = await CustomerService.getCustomerById(companyId, customerId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const result = await CustomerService.createCustomer(companyId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, customerId } = req.params;
      const result = await CustomerService.updateCustomer(companyId, customerId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, customerId } = req.params;
      const result = await CustomerService.deleteCustomer(companyId, customerId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
