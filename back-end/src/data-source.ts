// biome-ignore assist/source/organizeImports: Suppress sort imports
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import 'dotenv/config';

//#region Masters
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
//#endregion

//#region Transactions
import { SerialNumber } from './modules/serial-number/serial-number.entity';
import { ProductSerial } from './modules/product/product-serial.entity';
import { StockInvoice } from './modules/invoices/stock-invoice/stock-invoice.entity';
import { StockLineItem } from './modules/invoices/stock-invoice/stock-line-item.entity';
import { Purchase } from './modules/invoices/purchase/purchase.entity';
import { PurchaseLineItem } from './modules/invoices/purchase/purchase-line-item.entity';
import { Sales } from './modules/invoices/sales/sales.entity';
import { SalesLineItem } from './modules/invoices/sales/sales-line-item.entity';
import { SalesReturn } from './modules/invoices/sales-return/sales-return.entity';
import { SalesReturnItem } from './modules/invoices/sales-return/sales-return-item.entity';
import { PurchaseReturn } from './modules/invoices/purchase-return/purchase-return.entity';
import { PurchaseReturnItem } from './modules/invoices/purchase-return/purchase-return-item.entity';
//#endregion

const {
  NODE_ENV = 'development',
  DB_TYPE = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER,
  DB_PASSWORD,
  DB_NAME = 'fanda_v3'
} = process.env;

const dbConnection: {
  type: 'postgres' | 'sqlite' | 'better-sqlite3' | 'mysql' | 'mariadb' | 'mssql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
} = {
  type: 'postgres',
  database: 'fanda_v3'
};

if (DB_TYPE === 'sqlite' || DB_TYPE === 'better-sqlite3') {
  // dbConnection.type = 'better-sqlite3';
  dbConnection.database = `${DB_NAME}.db`;
  switch (DB_TYPE) {
    case 'sqlite':
      dbConnection.type = 'sqlite';
      break;
    case 'better-sqlite3':
      dbConnection.type = 'better-sqlite3';
      break;
    default:
      dbConnection.type = 'better-sqlite3';
  }
} else {
  dbConnection.host = DB_HOST;
  dbConnection.port = Number(DB_PORT);
  dbConnection.username = DB_USER || 'postgres';
  dbConnection.password = DB_PASSWORD || 'postgres';
  dbConnection.database = DB_NAME;
  switch (DB_TYPE) {
    case 'postgres':
      dbConnection.type = 'postgres';
      break;
    case 'mysql':
      dbConnection.type = 'mysql';
      break;
    case 'mariadb':
      dbConnection.type = 'mariadb';
      break;
    case 'mssql':
      dbConnection.type = 'mssql';
      break;
    default:
      dbConnection.type = 'postgres';
  }
}

export const AppDataSource = new DataSource({
  // type: 'postgres',
  // type: 'better-sqlite3',
  // host: DB_HOST,
  // port: Number(DB_PORT),
  // username: DB_USERNAME,
  // password: DB_PASSWORD,
  // database: 'fanda-v3.db', //DB_DATABASE,
  ...dbConnection,
  synchronize: true,
  logging: NODE_ENV === 'development',
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
    ProductSerial,
    SerialNumber,
    StockInvoice,
    StockLineItem,
    Purchase,
    PurchaseLineItem,
    Sales,
    SalesLineItem,
    SalesReturn,
    SalesReturnItem,
    PurchaseReturn,
    PurchaseReturnItem
  ],
  migrations: [`${__dirname}/migrations/*.ts`],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy()
});
