import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
import { FinancialYear } from '../financial-year/financial-year.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_serials' })
// @Index(['yearId', 'productId', 'serialId'], { unique: true })
export class ProductSerial {
  @PrimaryColumn('uuid')
  yearId!: string;

  @PrimaryColumn('uuid')
  productId!: string;

  @PrimaryColumn('uuid')
  serialId!: string;

  @BeforeInsert()
  generateId() {
    if (!this.serialId) this.serialId = v7();
  }

  @Column({ length: 15, nullable: true })
  prefix?: string;

  @Column({ default: 1 })
  current!: number;

  @Column({ default: 7 })
  length!: number;

  @ManyToOne(() => FinancialYear, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'year_id' })
  year?: FinancialYear;

  @ManyToOne(() => Product, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
