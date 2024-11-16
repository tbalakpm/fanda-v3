import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';

import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { Company } from '../../entities/company.entity';
import { Address } from '../../entities/address.entity';
import { Contact } from '../../entities/contact.entity';

@Entity({ name: 'consumers' })
@Index(['companyId', 'consumerId'], { unique: true })
export class Consumer {
  @PrimaryColumn('uuid')
  consumerId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.consumerId) this.consumerId = v7();
  }

  @Column({ length: 50 })
  name!: string;

  @Column({ type: 'jsonb', default: {} })
  address?: Address;

  @Column({ type: 'jsonb', default: {} })
  contact?: Contact;

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
