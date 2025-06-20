import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

// import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { FinancialYear } from '../financial-year/financial-year.entity';

@Entity({ name: 'serial_numbers' })
// @Index(['yearId', 'serialId'], { unique: true })
@Index(['yearId', 'key'], { unique: true })
export class SerialNumber {
  @PrimaryColumn('uuid')
  yearId!: string;

  @PrimaryColumn('uuid')
  serialId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.serialId) this.serialId = v7();
  }

  @Column({ length: 15 })
  key!: string;

  @Column({ length: 15, nullable: true })
  prefix?: string;

  @Column({ default: 1 })
  current!: number;

  @Column({ default: 7 })
  length!: number;

  // @Column({ name: 'is_active', default: true })
  // isActive!: boolean;

  // @Column(() => AuditDates)
  // date!: AuditDates;

  // @Column(() => AuditUsers)
  // user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => FinancialYear, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'year_id' })
  year?: FinancialYear;
}
