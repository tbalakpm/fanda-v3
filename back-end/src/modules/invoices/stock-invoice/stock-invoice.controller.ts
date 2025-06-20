import type { NextFunction, Request, Response } from 'express';

import * as StockInvoiceService from './stock-invoice.service';
import type { User } from '../../../entities/user.entity';
import { ApiError } from '../../../responses/api-error';
import { ApiResponse, ApiStatus } from '../../../responses';
import type { StockInvoice } from './stock-invoice.entity';
import type { GetAllQuery } from '../../../interfaces/get-all-query';

// export class StockInvoiceController {
export async function getAllStockInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    const getAllQuery: GetAllQuery = req.query;
    // console.log('companyId', companyId, 'yearId', yearId);
    const result = await StockInvoiceService.getAllStockInvoices(companyId, yearId, getAllQuery);
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getStockInvoiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;
    // console.log('companyId', companyId, 'yearId', yearId);

    const result = await StockInvoiceService.getStockInvoiceById(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createStockInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId } = req.params;
    // console.log('companyId', companyId, 'yearId', yearId);

    const result = await StockInvoiceService.createStockInvoice(companyId, yearId, req.body, (req.currentUser as User).userId);
    if (!result.success) {
      return next(new ApiError(result.message, result.status));
    }
    res.status(result.status).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateStockInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    // const { companyId, yearId } = req.params;
    // const result = await StockInvoiceService.updateStockInvoice(companyId, yearId, req.body, (req.currentUser as User).userId);
    // if (!result.success) {
    //   return next(new ApiError(result.message, result.status));
    // }
    // res.status(result.status).json(result);
    const result = new ApiResponse<StockInvoice>();
    result.status = ApiStatus.NOT_IMPLEMENTED;
    res.status(result.status).json({ success: true, message: 'Not implemented yet' });
  } catch (error) {
    return next(error);
  }
}

export async function deleteStockInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, yearId, invoiceId } = req.params;
    const result = await StockInvoiceService.deleteStockInvoice(companyId, yearId, invoiceId);
    if (!result.success) {
      return next(new ApiError(result.message, 400));
    }

    res.status(result.status).json({ success: result.success, message: result.message });
  } catch (error) {
    return next(error);
  }
}
// }
