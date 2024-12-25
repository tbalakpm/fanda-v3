import { NextFunction, Request, Response } from 'express';

import { PurchaseServiceInstance as PurchaseService } from './purchase.service';
import { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import { Purchase } from './purchase.entity';

export class PurchaseController {
  static async getAllPurchases(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);
      const result = await PurchaseService.getAllPurchases(companyId, yearId);
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getPurchaseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await PurchaseService.getPurchaseById(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await PurchaseService.createPurchase(companyId, yearId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updatePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      // const { companyId, yearId } = req.params;
      // const result = await StockInvoiceService.updateStockInvoice(companyId, yearId, req.body, (req.currentUser as User).userId);
      // if (!result.success) {
      //   return next(new ApiError(result.message, result.status));
      // }
      // res.status(result.status).json(result);
      const result = new ApiResponse<Purchase>();
      result.status = ApiStatus.NOT_IMPLEMENTED;
      res.status(result.status).json({ success: true, message: 'Not implemented yet' });
    } catch (error) {
      return next(error);
    }
  }

  static async deletePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      const result = await PurchaseService.deletePurchase(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
      return next(error);
    }
  }
}
