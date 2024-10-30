import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Company } from "../company.entity";
import { AuditDates, AuditUsers } from "../embedded/audit.entity";
import { v7 } from "uuid";

@Entity({ name: "units" })
export class Unit {
  @PrimaryColumn("uuid")
  id!: string;

  @BeforeInsert()
  generateId() {
    this.id = v7();
  }

  @Column({ name: "code", length: 15, nullable: false, unique: true })
  code!: string;

  @Column({ name: "name", length: 50, nullable: false, unique: true })
  name!: string;

  @Column({ name: "description", length: 255, nullable: true })
  description?: string;

  @ManyToOne(() => Unit, { nullable: true, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "base_unit_id" })
  baseUnitId?: string;

  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;
}
