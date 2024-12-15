import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
//import { Address, Contact } from "./";
import { AuditDates, AuditUsers } from './embedded/audit.entity';
import { Address } from './address.entity';
import { Contact } from './contact.entity';
import 'dotenv/config';

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
}
