import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 } from "uuid";
import { AuditDates, AuditUsers, Company } from "../../entities";
import { ProductCategory } from "../product-category/product-category.entity";
import { Unit } from "../unit/unit.entity";

@Entity({ name: "products" })
@Index(["companyId", "productId"], { unique: true })
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Product {
  @PrimaryColumn("uuid")
  productId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.productId) this.productId = v7();
  }

  @Column({ length: 15 })
  code!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ length: 10, default: "Good" }) // enum: Good or Service
  type!: string;

  @Column("uuid")
  categoryId!: string;

  @Column("uuid")
  baseUnitId!: string;

  @Column({ nullable: true })
  buyingPrice?: number;

  @Column({ nullable: true })
  marginPct?: number;

  @Column({ nullable: true })
  marginAmt?: number;

  // @Column({ nullable: true }) // enum: Inclusive or Exclusive
  // taxPricing?: string;

  @Column({ nullable: true })
  sellingPrice?: number;

  // @Column({ length: 5, default: "GST" }) // enum: GST, VAT, PST, QST, HST, RST, etc.,
  // taxType!: string;

  @Column({ nullable: true })
  taxCode?: string;

  @Column({ nullable: true })
  taxPct?: number;

  @Column({ length: 15, default: "NO_TAX" }) // enum: No Tax, Taxable, Non-Taxable, Zero-Rated, Exempt, Out-of-Scope, Reverse Charge, Withholding
  taxPreference!: string;

  @Column({ nullable: true, default: false })
  isPriceInclusiveTax?: boolean;

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
  @JoinColumn({ name: "category_id" })
  category?: ProductCategory;

  @ManyToOne(() => Unit, { nullable: true, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "base_unit_id" })
  unit?: Unit;

  @ManyToOne(() => Company, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company;
}
