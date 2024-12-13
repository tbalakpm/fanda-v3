import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { StockInvoice } from './stock-invoice.entity';
import { Product } from '../product/product.entity';
import { Unit } from '../unit/unit.entity';
import { v7 } from 'uuid';

@Entity({ name: 'stock_line_items' })
// @Index(['invoiceId', 'lineItemId'], { unique: true })
export class StockLineItem {
  @PrimaryColumn('uuid')
  invoiceId!: string;

  @PrimaryColumn('uuid')
  lineItemId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.lineItemId) this.lineItemId = v7();
  }

  @Column('uuid')
  productId!: string;

  @Column('uuid')
  unitId!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ length: 15, nullable: true, default: '' })
  gtn?: string;

  @Column({ nullable: true })
  mfdDate?: Date;

  @Column({ nullable: true })
  expiryDate?: Date;

  @Column()
  qty!: number;

  @Column()
  rate!: number;

  @Column()
  price!: number;

  @Column({ nullable: true })
  marginPct?: number;

  @Column({ nullable: true })
  marginAmt?: number;

  @Column({ nullable: true })
  sellingPrice?: number;

  @Column({ nullable: true })
  discountPct?: number;

  @Column({ nullable: true })
  discountAmt?: number;

  @Column({ nullable: true })
  taxCode?: string;

  @Column({ nullable: true })
  taxPct?: number;

  @Column({ nullable: true })
  taxAmt?: number;

  @Column()
  lineTotal!: number;

  // Related Entities
  @ManyToOne(() => StockInvoice, (invoice) => invoice.lineItems, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: StockInvoice;

  @ManyToOne(() => Product, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @ManyToOne(() => Unit, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;
}
