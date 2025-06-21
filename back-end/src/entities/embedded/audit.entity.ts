import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { auditDateDataType } from '../../helpers/data-type.helper';
import 'dotenv/config';

export class AuditDates {
  @CreateDateColumn({ name: 'created', type: auditDateDataType(), default: () => 'CURRENT_TIMESTAMP' })
  created?: Date;

  @UpdateDateColumn({ name: 'updated', type: auditDateDataType(), default: () => 'CURRENT_TIMESTAMP' })
  updated?: Date;
}

export class AuditUsers {
  @Column({ name: 'created', type: 'uuid', nullable: true })
  created?: string;

  @Column({ name: 'updated', type: 'uuid', nullable: true })
  updated?: string;
}
