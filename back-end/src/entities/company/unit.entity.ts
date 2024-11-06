import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Company } from "../company.entity";
import { AuditDates, AuditUsers } from "../embedded/audit.entity";
import { v7 } from "uuid";

@Entity({ name: "units" })
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Unit {
  @PrimaryColumn("uuid", { name: "company_id" })
  companyId!: string;

  @PrimaryColumn("uuid", { name: "unit_id" })
  unitId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.unitId) this.unitId = v7();
  }

  @Column({ name: "code", length: 15, nullable: false, unique: true })
  code!: string;

  @Column({ name: "name", length: 50, nullable: false, unique: true })
  name!: string;

  @Column({ name: "description", length: 255, nullable: true })
  description?: string;

  @Column({ name: "base_unit_id", nullable: true })
  baseUnitId?: string;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => Unit, { nullable: true, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "base_unit_id" })
  baseUnit?: Unit;

  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company;
}
