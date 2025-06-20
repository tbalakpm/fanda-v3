import type { Request, Response, NextFunction } from 'express';
import * as InventoryService from './inventory.service';
import { ApiError, ApiStatus } from '../../responses';

// class InventoryController {
export async function searchGtn(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, gtn } = req.params;
    const inventory = await InventoryService.searchGtn(companyId, gtn);
    if (!inventory) {
      return next(new ApiError('Inventory not found', 404));
    }
    res.status(200).json({ success: true, message: 'Inventory found', data: inventory, status: ApiStatus.OK });
  } catch (error) {
    return next(error);
  }
}
// }

// export default new InventoryController();
