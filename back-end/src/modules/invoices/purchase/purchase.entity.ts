import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

import { AuditDates, AuditUsers } from '../../../entities/embedded/audit.entity';
import { FinancialYear } from '../../financial-year/financial-year.entity';
import { PurchaseLineItem } from './purchase-line-item.entity';
import { Company } from '../../../entities';
import { Supplier } from '../../supplier/supplier.entity';

@Entity({ name: 'purchases' })
@Index(['companyId', 'yearId', 'invoiceId'], { unique: true })
@Index(['companyId', 'yearId', 'invoiceNumber'], { unique: true })
export class Purchase {
  @PrimaryColumn('uuid')
  invoiceId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.invoiceId) this.invoiceId = v7();
  }

  @Column({ length: 15 })
  invoiceNumber!: string;

  @Column()
  invoiceDate!: Date;

  @Column('uuid')
  supplierId!: string;

  @Column({ length: 25, nullable: true })
  refNumber?: string;

  @Column({ type: 'date', nullable: true })
  refDate?: Date;

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0.0 })
  totalQty!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  subtotal!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  discountPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  discountAmt!: number;

  // @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  // taxPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  totalTaxAmt!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  additionalCharges!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  netAmount!: number;

  @Column({ length: 255, nullable: true })
  notes?: string;

  @Column('uuid')
  companyId!: string;

  @Column('uuid')
  yearId!: string;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @OneToMany(() => PurchaseLineItem, (lineItem) => lineItem.invoice, { cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  lineItems?: PurchaseLineItem[];

  @ManyToOne(() => Supplier, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @ManyToOne(() => Company, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ManyToOne(() => FinancialYear, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'year_id' })
  year?: FinancialYear;
}