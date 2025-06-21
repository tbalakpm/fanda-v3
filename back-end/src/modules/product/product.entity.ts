import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
// import { AuditDates, AuditUsers, Company } from "../../entities";
import { AuditDates, AuditUsers } from '../../entities/embedded/audit.entity';
import { Company } from '../../entities/company.entity';
import { ProductCategory } from '../product-category/product-category.entity';
import { Unit } from '../unit/unit.entity';
import { ProductTypes } from './product-type.enum';
import { TaxPreferences } from './tax-preference.enum';
import { GtnGeneration } from './gtn-generation.enum';
import 'dotenv/config';
import { enumDataType } from '../../helpers/data-type.helper';

@Entity({ name: 'products' })
@Index(['companyId', 'productId'], { unique: true })
@Index(['companyId', 'code'], { unique: true })
@Index(['companyId', 'name'], { unique: true })
export class Product {
  @PrimaryColumn('uuid')
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

  @Column({ type: enumDataType(), enum: ProductTypes, default: ProductTypes.Goods }) // enum: ProductTypes,
  productType!: ProductTypes;

  @Column('uuid')
  categoryId!: string;

  @Column('uuid')
  baseUnitId!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  buyingPrice!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  marginPct!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  marginAmt!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  sellingPrice!: number;

  @Column({ nullable: true })
  taxCode?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  taxPct?: number;

  @Column({ type: enumDataType(), enum: TaxPreferences, default: TaxPreferences.NoTax }) // enum: TaxPreferences,
  taxPreference!: TaxPreferences;

  @Column({ nullable: true, default: false })
  isPriceInclusiveTax?: boolean;

  @Column({ type: enumDataType(), enum: GtnGeneration, default: GtnGeneration.Tag }) // enum: GtnGeneration,
  gtnGeneration!: GtnGeneration;

  @Column('uuid')
  companyId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column(() => AuditDates)
  date!: AuditDates;

  @Column(() => AuditUsers)
  user!: AuditUsers;

  // Related Entities
  @ManyToOne(() => ProductCategory, { nullable: true, onUpdate: 'CASCADE', onDelete: 'RESTRICT' /*, eager: true*/ })
  @JoinColumn({ name: 'category_id' })
  category?: ProductCategory;

  @ManyToOne(() => Unit, { nullable: true, onUpdate: 'CASCADE', onDelete: 'RESTRICT' /*, eager: true*/ })
  @JoinColumn({ name: 'base_unit_id' })
  unit?: Unit;

  @ManyToOne(() => Company, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;
}
