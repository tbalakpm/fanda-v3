import type { QueryRunner } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Inventory } from './inventory.entity';
import { InvoiceTypes } from '../invoices/invoice-type.enum';

// export class InventoryService {
const inventoryRepository = AppDataSource.getRepository(Inventory);

export async function getInventoryByGtn(companyId: string, gtn: string): Promise<Inventory | null> {
  return await inventoryRepository.findOneBy({ companyId, gtn });
}

export async function saveInventory(queryRunner: QueryRunner, inventory: Inventory): Promise<Inventory> {
  const dbInventory = await queryRunner.manager
    .createQueryBuilder(Inventory, 'inventory')
    .useTransaction(true)
    // .setLock('pessimistic_write')
    .where('inventory.companyId = :companyId', { companyId: inventory.companyId })
    .andWhere('inventory.productId = :productId', { productId: inventory.productId })
    .andWhere('inventory.gtn = :gtn', { gtn: inventory.gtn })
    .getOne();

  switch (inventory.invoiceType) {
    case InvoiceTypes.Stock:
    case InvoiceTypes.Purchase:
    case InvoiceTypes.SalesReturn:
      inventory.qtyOnHand = Math.abs(inventory.qtyOnHand);
      break;
    case InvoiceTypes.Sales:
    case InvoiceTypes.PurchaseReturn:
      inventory.qtyOnHand = -Math.abs(inventory.qtyOnHand);
      break;
    default:
      break;
  }

  if (!dbInventory) {
    //inventory.companyId = companyId;
    const createdInventory = queryRunner.manager.create(Inventory, inventory);
    const savedInventory = await queryRunner.manager.save(createdInventory);
    return savedInventory;
  }

  dbInventory.qtyOnHand += inventory.qtyOnHand;
  const savedInventory = await queryRunner.manager.save(dbInventory);
  return savedInventory;
}

export async function updateQtyOnHandByGTN(
  queryRunner: QueryRunner,
  companyId: string,
  productId: string,
  gtn: string,
  qty: number
): Promise<Inventory> {
  const updatedInventory = await queryRunner.manager.update(Inventory, { companyId, productId, gtn }, { qtyOnHand: () => `qtyOnHand + ${qty}` });
  return updatedInventory.raw[0];
}

export async function updateQtyOnHandByInvoice(
  queryRunner: QueryRunner,
  companyId: string,
  invoiceId: string,
  lineItemId: string,
  qty: number
): Promise<Inventory> {
  const updatedInventory = await queryRunner.manager.update(
    Inventory,
    { companyId, invoiceId, lineItemId },
    { qtyOnHand: () => `qtyOnHand + ${qty}` }
  );
  return updatedInventory.raw[0];
}

export async function searchGtn(companyId: string, gtn: string): Promise<Inventory | null> {
  return await inventoryRepository.findOne({
    where: { companyId, gtn },
    select: {
      inventoryId: true,
      companyId: true,
      gtn: true,
      productId: true,
      product: {
        productId: true,
        code: true,
        name: true
        // buyingPrice: true,
        // sellingPrice: true,
        // marginPct: true,
        // marginAmt: true
      },
      unitId: true,
      unit: { unitId: true, code: true, name: true },
      qtyOnHand: true,
      buyingPrice: true,
      sellingPrice: true,
      marginPct: true,
      marginAmt: true
    },
    relations: ['product', 'unit'],
    relationLoadStrategy: 'query'
  });
}
// }
