import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 } from "uuid";
// import { Address, Contact, AuditDates, AuditUsers, Company } from "../../entities";
import { AuditDates, AuditUsers } from "../../entities/embedded/audit.entity";
import { Company } from "../../entities/company.entity";
import { Address } from "../../entities/address.entity";
import { Contact } from "../../entities/contact.entity";

@Entity({ name: "suppliers" })
@Index(["companyId", "supplierId"], { unique: true })
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Supplier {
  @PrimaryColumn("uuid")
  supplierId!: string;

  @Column({ length: 10, unique: true })
  code!: string;

  @BeforeInsert()
  generateId() {
    if (!this.supplierId) this.supplierId = v7();
  }

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ type: "jsonb", default: {} })
  address?: Address;

  @Column({ type: "jsonb", default: {} })
  contact?: Contact;

  @Column("uuid")
  companyId!: string;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => Company, { onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company;
}