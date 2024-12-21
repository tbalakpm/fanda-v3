import { Column } from 'typeorm';
import 'dotenv/config';

console.log('AuditEntity.DB_TYPE:', process.env.DB_TYPE);

export class AuditDates {
  // @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  // @CreateDateColumn({ name: 'created', type: auditDateDataType(), default: () => 'CURRENT_TIMESTAMP' })
  @Column({ name: 'created', default: () => 'CURRENT_TIMESTAMP' })
  created?: Date;

  // @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  // @UpdateDateColumn({ name: 'updated', type: auditDateDataType(), default: () => 'CURRENT_TIMESTAMP' })
  @Column({ name: 'updated', default: () => 'CURRENT_TIMESTAMP' })
  updated?: Date;
}

export class AuditUsers {
  @Column({ name: 'created', type: 'uuid', nullable: true })
  // @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  // @JoinColumn({ name: "created" })
  created?: string;

  @Column({ name: 'updated', type: 'uuid', nullable: true })
  // @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  // @JoinColumn({ name: "updated" })
  updated?: string;
}
