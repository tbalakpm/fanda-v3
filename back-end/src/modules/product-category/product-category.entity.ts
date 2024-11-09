import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 } from "uuid";
import { AuditDates, AuditUsers, Company } from "../../entities";

@Entity({ name: "product_categories" })
@Index(["companyId", "categoryId"], { unique: true })
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class ProductCategory {
  @PrimaryColumn("uuid")
  categoryId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.categoryId) this.categoryId = v7();
  }

  @Column({ length: 15 })
  code!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column("uuid")
  companyId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => ProductCategory, { nullable: true, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "parent_id" })
  parent?: ProductCategory;

  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company;
}
