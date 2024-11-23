import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

import { Company } from '../../entities';
import { Product } from '../product/product.entity';
import { Unit } from '../unit/unit.entity';
import { Supplier } from '../supplier/supplier.entity';

@Entity({ name: 'inventories' })
@Index(['invoiceId', 'lineItemId'])
@Index(['companyId', 'gtn'], { unique: true })
export class Inventory {
  @PrimaryColumn('uuid')
  companyId!: string;

  @PrimaryColumn('uuid')
  inventoryId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.inventoryId) this.inventoryId = v7();
  }

  @Column('uuid')
  invoiceId!: string;

  @Column('uuid')
  lineItemId!: string;

  @Column({ length: 15 })
  invoiceType!: string; // enum: ['purchase', 'sales-return', 'stock', 'transfer']

  @Column('uuid', { nullable: true })
  supplierId?: string;

  @Column('uuid')
  productId!: string;

  @Column('uuid')
  unitId!: string;

  @Column({ length: 15, nullable: true, default: '' })
  gtn?: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column()
  qtyOnHand!: number;

  @Column({ nullable: true })
  buyinPrice?: number;

  @Column({ nullable: true })
  marginPct?: number;

  @Column({ nullable: true })
  marginAmt?: number;

  @Column({ nullable: true })
  sellingPrice?: number;

  @Column({ nullable: true })
  mfdDate?: Date;

  @Column({ nullable: true })
  expiryDate?: Date;

  // Related Entities
  @ManyToOne(() => Supplier, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @ManyToOne(() => Product, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @ManyToOne(() => Unit, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;

  @ManyToOne(() => Company, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;
}
