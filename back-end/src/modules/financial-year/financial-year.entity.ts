import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { v7 } from 'uuid';

@Entity({ name: 'financial_years' })
@Index(['companyId', 'yearId'], { unique: true })
@Index(['companyId', 'code'], { unique: true })
export class FinancialYear {
  @PrimaryColumn('uuid')
  yearId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.yearId) this.yearId = v7();
  }

  @Column({ length: 15 })
  code!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: 'date' })
  beginDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column('uuid')
  companyId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => Company, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;
}
