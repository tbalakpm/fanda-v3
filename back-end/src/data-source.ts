import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import 'dotenv/config';

import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Unit } from './modules/unit/unit.entity';
import { ProductCategory } from './modules/product-category/product-category.entity';
import { Product } from './modules/product/product.entity';
import { Supplier } from './modules/supplier/supplier.entity';
import { Customer } from './modules/customer/customer.entity';
import { Consumer } from './modules/consumer/consumer.entity';
import { Inventory } from './modules/inventory/inventory.entity';
import { FinancialYear } from './modules/financial-year/financial-year.entity';
import { SerialNumber } from './modules/serial-number/serial-number.entity';
import { StockInvoice } from './modules/stock-invoice/stock-invoice.entity';
import { StockLineItem } from './modules/stock-invoice/stock-line-item.entity';

const { DB_HOST = 'localhost', DB_PORT = '5432', DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV = 'development' } = process.env;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: NODE_ENV === 'development' ? true : false,
  entities: [
    User,
    Company,
    Unit,
    ProductCategory,
    Product,
    Supplier,
    Customer,
    Consumer,
    Inventory,
    FinancialYear,
    SerialNumber,
    StockInvoice,
    StockLineItem
  ],
  migrations: [__dirname + '/migrations/*.ts'],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy()
});
