import { NextFunction, Request, Response } from 'express';

import { SalesServiceInstance as SalesService } from './sales.service';
import { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import { Sales } from './sales.entity';
import { GetAllQuery } from '../../../interfaces/get-all-query';

export class SalesController {
  static async getAllSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      const getAllQuery: GetAllQuery = req.query;
      // console.log('companyId', companyId, 'yearId', yearId);
      const result = await SalesService.getAllSales(companyId, yearId, getAllQuery);
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async getSalesById(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await SalesService.getSalesById(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async createSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId } = req.params;
      // console.log('companyId', companyId, 'yearId', yearId);

      const result = await SalesService.createSales(companyId, yearId, req.body, (req.currentUser as User).userId);
      if (!result.success) {
        return next(new ApiError(result.message, result.status));
      }
      res.status(result.status).json(result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateSales(req: Request, res: Response, next: NextFunction) {
    try {
      // const { companyId, yearId } = req.params;
      // const result = await StockInvoiceService.updateStockInvoice(companyId, yearId, req.body, (req.currentUser as User).userId);
      // if (!result.success) {
      //   return next(new ApiError(result.message, result.status));
      // }
      // res.status(result.status).json(result);
      const result = new ApiResponse<Sales>();
      result.status = ApiStatus.NOT_IMPLEMENTED;
      res.status(result.status).json({ success: true, message: 'Not implemented yet' });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, yearId, invoiceId } = req.params;
      const result = await SalesService.deleteSales(companyId, yearId, invoiceId);
      if (!result.success) {
        return next(new ApiError(result.message, 400));
      }

      res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
      return next(error);
    }
  }
}
