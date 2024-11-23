import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { FinancialYear } from '../financial-year/financial-year.entity';
import { StockLineItem } from './stock-line-item.entity';

@Entity({ name: 'stock_invoices' })
@Index(['yearId', 'invoiceId'], { unique: true })
@Index(['yearId', 'invoiceNumber'], { unique: true })
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

  @Column()
  totalQty!: number;

  @Column()
  totalAmount!: number;

  @Column({ length: 255, nullable: true })
  notes?: string;

  @Column('uuid')
  yearId!: string;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @OneToMany(() => StockLineItem, (lineItem) => lineItem.invoice, { cascade: false, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  lineItems?: StockLineItem[];

  @ManyToOne(() => FinancialYear, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'year_id' })
  year?: FinancialYear;
}
