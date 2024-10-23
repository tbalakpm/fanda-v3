import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "../user.entity";
import { v7 as uuidv7, v7 } from "uuid";

export abstract class AppBaseEntity extends BaseEntity {
  //@PrimaryGeneratedColumn("uuid")
  @PrimaryColumn({ name: "id", primary: true, type: "uuid", default: () => v7() })
  id!: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7(); //String(Math.random());
  }

  @Column({ name: "is_active", nullable: false, default: true })
  isActive: boolean = true;

  @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "created_by" })
  createdBy!: string;

  @ManyToOne(() => User, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "updated_by" })
  updatedBy!: string;

  @CreateDateColumn({ name: "created_at", nullable: false })
  createdAt!: Date; // = new Date();

  @UpdateDateColumn({ name: "updated_at", nullable: false })
  updatedAt!: Date; // = new Date();
}
