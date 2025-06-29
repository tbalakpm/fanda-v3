import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
import { AuditDates, AuditUsers } from './embedded/audit.entity';
import type { Address } from './address.entity';
import type { Contact } from './contact.entity';
import 'dotenv/config';
import { FinancialYear } from '../modules/financial-year/financial-year.entity';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryColumn('uuid')
  companyId!: string;

  @Column({ length: 10, unique: true })
  code!: string;

  @BeforeInsert()
  generateId() {
    if (!this.companyId) this.companyId = v7();
  }

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: process.env.DB_TYPE === 'postgres' ? 'jsonb' : 'simple-json', default: process.env.DB_TYPE === 'postgres' ? {} : '{}' })
  address?: Address;

  @Column({ type: process.env.DB_TYPE === 'postgres' ? 'jsonb' : 'simple-json', default: process.env.DB_TYPE === 'postgres' ? {} : '{}' })
  contact?: Contact;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  @OneToMany(() => FinancialYear, (year) => year.company, { eager: true })
  years?: FinancialYear[];
}
