import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { StockInvoice } from './stock-invoice.entity';
import { Product } from '../../product/product.entity';
import { Unit } from '../../unit/unit.entity';
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

  @Column({ length: 50, nullable: true, default: '' })
  gtn?: string;

  @Column({ nullable: true })
  mfdDate?: Date;

  @Column({ nullable: true })
  expiryDate?: Date;

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0.0 })
  qty!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  rate!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  price!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  marginPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  marginAmt!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  sellingPrice!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  discountPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  discountAmt!: number;

  @Column({ nullable: true })
  taxCode?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  taxPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  taxAmt!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
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
