import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 } from "uuid";
import { AuditDates, AuditUsers } from "../../entities/embedded/audit.entity";
import { Company } from "../../entities/company.entity";

// import { Company, AuditDates, AuditUsers } from "../../entities";

@Entity({ name: "units" })
@Index(["companyId", "unitId"], { unique: true })
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Unit {
  @PrimaryColumn("uuid")
  unitId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.unitId) this.unitId = v7();
  }

  @Column({ length: 15 })
  code!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ nullable: true })
  baseUnitId?: string;

  @Column("uuid")
  companyId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => Unit, { nullable: true, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "base_unit_id" })
  baseUnit?: Unit;

  @ManyToOne(() => Company, { onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company;
}
