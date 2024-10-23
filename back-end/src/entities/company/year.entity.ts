import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Company } from "../company.entity";
import { AuditDates, AuditUsers } from "../embedded/audit.entity";
import { v7 } from "uuid";

@Entity({ name: "years" })
export class Year {
  @PrimaryColumn("uuid")
  id!: string;

  @BeforeInsert()
  generateId() {
    this.id = v7();
  }

  @Column({ length: 10, nullable: false, unique: true })
  code!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ name: "begin_date", type: "date", nullable: false })
  beginDate!: Date;

  @Column({ name: "end_date", type: "date", nullable: false })
  endDate!: Date;

  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @Column({ name: "is_active", default: true })
  isActive: boolean = true;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;
}
