import { DeleteResult, QueryRunner } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Inventory } from './inventory.entity';

export class InventoryService {
  static readonly inventoryRepository = AppDataSource.getRepository(Inventory);

  static async saveInventory(queryRunner: QueryRunner, companyId: string, inventory: Inventory): Promise<Inventory> {
    const dbInventory = await queryRunner.manager
      .createQueryBuilder(Inventory, 'inventory')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('inventory.companyId = :companyId', { companyId })
      .andWhere('inventory.productId = :productId', { productId: inventory.productId })
      .andWhere('inventory.gtn = :gtn', { gtn: inventory.gtn })
      .getOne();

    if (!dbInventory) {
      inventory.companyId = companyId;
      const createdInventory = queryRunner.manager.create(Inventory, inventory);
      const savedInventory = await queryRunner.manager.save(createdInventory);
      return savedInventory;
    }

    dbInventory.qtyOnHand += inventory.qtyOnHand;
    const savedInventory = await queryRunner.manager.save(dbInventory);
    return savedInventory;
  }

  static async updateQtyOnHand(queryRunner: QueryRunner, companyId: string, productId: string, gtn: string, qty: number): Promise<Inventory> {
    const dbInventory = await queryRunner.manager
      .createQueryBuilder(Inventory, 'inventory')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .where('inventory.companyId = :companyId', { companyId })
      .andWhere('inventory.productId = :productId', { productId })
      .andWhere('inventory.gtn = :gtn', { gtn })
      .getOne();

    if (!dbInventory) {
      throw new Error(`Inventory with companyId '${companyId}', productId '${productId}', gtn '${gtn}' not found`);
    }

    dbInventory.qtyOnHand += qty;
    const savedInventory = await queryRunner.manager.save(dbInventory);
    return savedInventory;
  }

  static async getInventories(companyId: string): Promise<Inventory[]> {
    return await this.inventoryRepository.findBy({ companyId });
  }

  static async getInventory(inventoryId: string): Promise<Inventory | null> {
    return await this.inventoryRepository.findOneBy({ inventoryId });
  }

  static async updateInventory(
    inventoryId: string,
    invoiceId: string,
    lineItemId: string,
    invoiceType: string,
    supplierId: string,
    productId: string,
    unitId: string,
    gtn: string,
    description: string,
    qtyOnHand: number,
    buyinPrice: number,
    marginPct: number,
    marginAmt: number,
    sellingPrice: number,
    mfdDate: Date,
    expiryDate: Date
  ): Promise<Inventory> {
    const inventory = await this.getInventory(inventoryId);
    if (!inventory) {
      throw new Error(`Inventory with id '${inventoryId}' not found`);
    }
    inventory.invoiceId = invoiceId;
    inventory.lineItemId = lineItemId;
    inventory.invoiceType = invoiceType;
    inventory.supplierId = supplierId;
    inventory.productId = productId;
    inventory.unitId = unitId;
    inventory.gtn = gtn;
    inventory.description = description;
    inventory.qtyOnHand = qtyOnHand;
    inventory.buyinPrice = buyinPrice;
    inventory.marginPct = marginPct;
    inventory.marginAmt = marginAmt;
    inventory.sellingPrice = sellingPrice;
    inventory.mfdDate = mfdDate;
    inventory.expiryDate = expiryDate;

    return this.inventoryRepository.save(inventory);
  }

  static async deleteInventory(inventoryId: string): Promise<DeleteResult> {
    return this.inventoryRepository.delete(inventoryId);
  }

  static async getInventoryByGtn(companyId: string, gtn: string): Promise<Inventory | null> {
    return this.inventoryRepository.findOneBy({ companyId, gtn });
  }

  static async getInventoryByInvoiceId(companyId: string, invoiceId: string): Promise<Inventory[]> {
    return this.inventoryRepository.findBy({ companyId, invoiceId });
  }
}
