import { NextFunction, Request, Response } from 'express';

import { PurchaseReturnServiceInstance as PurchaseReturnService } from './purchase-return.service';
import { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import { PurchaseReturn } from './purchase-return.entity';
import { GetAllQuery } from '../../../interfaces/get-all-query';

export class PurchaseReturnController {
  static async getAllPurchaseReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      const getAllQuery: GetAllQuery = req.query;
      // console.log('companyId', companyId, 'yearId', yearId);
      const result = await PurchaseReturnService.getAllPurchaseReturns(companyId, yearId, getAllQuery);
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getPurchaseReturnById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await PurchaseReturnService.getPurchaseReturnById(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createPurchaseReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await PurchaseReturnService.createPurchaseReturn(companyId, yearId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updatePurchaseReturn(req: Request, res: Response, next: NextFunction) {
    try {
      // const { companyId, yearId } = req.params;
      // const result = await StockInvoiceService.updateStockInvoice(companyId, yearId, req.body, (req.currentUser as User).userId);
      // if (!result.success) {
      //   return next(new ApiError(result.message, result.status));
      // }
      // res.status(result.status).json(result);
      const result = new ApiResponse<PurchaseReturn>();
      result.status = ApiStatus.NOT_IMPLEMENTED;
      res.status(result.status).json({ success: true, message: 'Not implemented yet' });
    } catch (error) {
      return next(error);
    }
  }

  static async deletePurchaseReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      const result = await PurchaseReturnService.deletePurchaseReturn(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
      return next(error);
    }
  }
}
