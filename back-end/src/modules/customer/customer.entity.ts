import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { Company } from '../../entities/company.entity';
import type { Address } from '../../entities/address.entity';
import type { Contact } from '../../entities/contact.entity';
import 'dotenv/config';
import { enumDataType } from '../../helpers/data-type.helper';
import { GSTTreatment } from '../party/gst-treatment.enum';

@Entity({ name: 'customers' })
@Index(['companyId', 'customerId'], { unique: true })
@Index(['companyId', 'code'], { unique: true })
@Index(['companyId', 'name'], { unique: true })
export class Customer {
  @PrimaryColumn('uuid')
  customerId!: string;

  @Column({ length: 10 })
  code!: string;

  @BeforeInsert()
  generateId() {
    if (!this.customerId) this.customerId = v7();
  }

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: process.env.DB_TYPE === 'postgres' ? 'jsonb' : 'simple-json', default: process.env.DB_TYPE === 'postgres' ? {} : '{}' })
  address?: Address;

  @Column({ type: process.env.DB_TYPE === 'postgres' ? 'jsonb' : 'simple-json', default: process.env.DB_TYPE === 'postgres' ? {} : '{}' })
  contact?: Contact;

  @Column({ name: 'gstin', length: 15, nullable: true })
  gstin?: string;

  @Column({ type: enumDataType(), enum: GSTTreatment, default: GSTTreatment.none }) // enum: TaxPreferences,
  gstTreatment!: GSTTreatment;

  @Column('uuid')
  companyId!: string;

  @Column({ name: 'is_active', default: true })
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
