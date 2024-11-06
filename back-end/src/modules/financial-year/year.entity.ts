import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Company } from "../../entities/company.entity";
import { AuditDates, AuditUsers } from "../../entities/embedded/audit.entity";
import { v7 } from "uuid";

@Entity({ name: "years" })
@Index(["companyId", "code"], { unique: true })
export class Year {
  @PrimaryColumn("uuid", { name: "company_id" })
  companyId!: string;

  @PrimaryColumn("uuid", { name: "year_id" })
  yearId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.yearId) this.yearId = v7();
  }

  @Column({ length: 10, nullable: false, unique: true })
  code!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ name: "begin_date", type: "date", nullable: false })
  beginDate!: Date;

  @Column({ name: "end_date", type: "date", nullable: false })
  endDate!: Date;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company;
}
