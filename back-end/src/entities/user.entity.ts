import { Entity, Column, PrimaryColumn, BeforeInsert } from "typeorm";
import { v7 } from "uuid";

@Entity({ name: "users" })
export class User {
  @PrimaryColumn("uuid")
  id!: string;

  @BeforeInsert()
  generateId() {
    this.id = v7();
  }

  @Column({ length: 25, unique: true })
  username!: string;

  @Column({ length: 100, select: false })
  password!: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ length: 25, nullable: true })
  phone?: string;

  @Column({ name: "first_name", length: 25, nullable: true })
  firstName?: string;

  @Column({ name: "last_name", length: 25, nullable: true })
  lastName?: string;

  @Column({ length: 15, default: "user" })
  role: string = "user";

  @Column({ name: "is_active", default: true })
  isActive: boolean = true;
}
