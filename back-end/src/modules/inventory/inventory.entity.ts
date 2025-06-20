import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

import { Company } from '../../entities';
import { Product } from '../product/product.entity';
import { Unit } from '../unit/unit.entity';
import { Supplier } from '../supplier/supplier.entity';
import { InvoiceTypes } from '../invoices/invoice-type.enum';
import { GtnGeneration } from '../product/gtn-generation.enum';
import 'dotenv/config';
import { enumDataType } from '../../helpers/dataType.helper';

@Entity({ name: 'inventories' })
@Index(['companyId', 'productId', 'gtn'], { unique: true })
@Index(['companyId', 'gtn'], { unique: true })
@Index(['companyId', 'invoiceId', 'lineItemId'])
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

  @Column({ type: enumDataType(), enum: InvoiceTypes, default: InvoiceTypes.Stock }) //  enum: InvoiceTypes,
  invoiceType!: InvoiceTypes;

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

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0.0 })
  qtyOnHand!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  buyingPrice!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  marginPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  marginAmt!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  sellingPrice!: number;

  @Column({ nullable: true })
  mfdDate?: Date;

  @Column({ nullable: true })
  expiryDate?: Date;

  @Column({ nullable: true, default: false })
  isPriceInclusiveTax?: boolean;

  @Column({ type: enumDataType(), enum: GtnGeneration, default: GtnGeneration.Tag }) // enum: GtnGeneration,
  gtnGeneration!: GtnGeneration;

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
