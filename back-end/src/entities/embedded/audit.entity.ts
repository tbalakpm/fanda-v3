import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import 'dotenv/config';
// import { User } from "../user.entity";

export class AuditDates {
  // @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @CreateDateColumn({ name: 'created', type: process.env.DB_TYPE === 'postgres' ? 'timestamptz' : 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created?: Date;

  // @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn({ name: 'updated', type: process.env.DB_TYPE === 'postgres' ? 'timestamptz' : 'datetime', default: () => 'CURRENT_TIMESTAMP' })
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
