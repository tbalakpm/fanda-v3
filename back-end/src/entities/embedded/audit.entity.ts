import { CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { User } from "../user.entity";

export class AuditDates {
  //@Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @CreateDateColumn({ name: "created" })
  created?: Date;

  //@Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn({ name: "updated" })
  updated?: Date;
}

export class AuditUsers {
  //@Column({ name: "created_by", type: "uuid" })
  @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "created" })
  created?: string;

  //@Column({ name: "updated_by", type: "uuid" })
  @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "updated" })
  updated?: string;
}
