import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { FinancialYear } from '../financial-year/financial-year.entity';
import { StockLineItem } from './stock-line-item.entity';
import { Company } from '../../entities';

@Entity({ name: 'stock_invoices' })
@Index(['companyId', 'yearId', 'invoiceId'], { unique: true })
@Index(['companyId', 'yearId', 'invoiceNumber'], { unique: true })
export class StockInvoice {
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

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0.0 })
  totalQty!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  totalAmount!: number;

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
  @OneToMany(() => StockLineItem, (lineItem) => lineItem.invoice, { cascade: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  lineItems?: StockLineItem[];

  @ManyToOne(() => Company, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ManyToOne(() => FinancialYear, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'year_id' })
  year?: FinancialYear;
}
