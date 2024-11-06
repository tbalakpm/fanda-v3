import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
// import { User } from "../user.entity";

export class AuditDates {
  // @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @CreateDateColumn({ name: "created", type: "timestamptz" })
  created?: Date;

  // @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn({ name: "updated", type: "timestamptz" })
  updated?: Date;
}

export class AuditUsers {
  @Column({ name: "created", type: "uuid", nullable: true })
  // @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  // @JoinColumn({ name: "created" })
  created?: string;

  @Column({ name: "updated", type: "uuid", nullable: true })
  // @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  // @JoinColumn({ name: "updated" })
  updated?: string;
}
