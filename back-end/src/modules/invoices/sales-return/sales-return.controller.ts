import { NextFunction, Request, Response } from 'express';

import { ReturnServiceInstance as ReturnService } from './sales-return.service';
import { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import { SalesReturn } from './sales-return.entity';
import { GetAllQuery } from '../../../interfaces/get-all-query';

export class SalesReturnController {
  static async getAllReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      const getAllQuery: GetAllQuery = req.query;
      // console.log('companyId', companyId, 'yearId', yearId);
      const result = await ReturnService.getAllReturns(companyId, yearId, getAllQuery);
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getReturnById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await ReturnService.getReturnById(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await ReturnService.createReturn(companyId, yearId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateReturn(req: Request, res: Response, next: NextFunction) {
    try {
      // const { companyId, yearId } = req.params;
      // const result = await StockInvoiceService.updateStockInvoice(companyId, yearId, req.body, (req.currentUser as User).userId);
      // if (!result.success) {
      //   return next(new ApiError(result.message, result.status));
      // }
      // res.status(result.status).json(result);
      const result = new ApiResponse<SalesReturn>();
      result.status = ApiStatus.NOT_IMPLEMENTED;
      res.status(result.status).json({ success: true, message: 'Not implemented yet' });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      const result = await ReturnService.deleteReturn(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
      return next(error);
    }
  }
}
