import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";
import { Address, Contact } from "./";
import { AuditDates, AuditUsers } from "./embedded/audit.entity";
import { v7 } from "uuid";

@Entity({ name: "companies" })
export class Company {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ length: 10, nullable: false, unique: true })
  code!: string;

  @BeforeInsert()
  generateId() {
    this.id = v7();
  }

  @Column({ length: 50, nullable: false, unique: true })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: false, default: {} })
  address?: Address;

  @Column({ type: "jsonb", nullable: false, default: {} })
  contact?: Contact;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;
}
