import "reflect-metadata";
// import process from "node:process";
// import { dirname } from "node:path";
// import { fileURLToPath } from "node:url";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import "dotenv/config";

import { User } from "./entities/user.entity";
import { Company } from "./entities/company.entity";
import { FinancialYear } from "./modules/financial-year/financial-year.entity";
import { Unit } from "./modules/unit/unit.entity";
import { ProductCategory } from "./modules/product-category/product-category.entity";
import { Product } from "./modules/product/product.entity";
import { Supplier } from "./modules/supplier/supplier.entity";
import { Customer } from "./modules/customer/customer.entity";
import { Consumer } from "./modules/consumer/consumer.entity";
import { SerialNumber } from "./modules/serial-number/serial-number.entity";

// const __dirname = dirname(fileURLToPath(import.meta.url));
const { DB_HOST = "localhost", DB_PORT = "5432", DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV = "development" } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: NODE_ENV === "development" ? true : false,
  entities: [User, Company, FinancialYear, Unit, ProductCategory, Product, Supplier, Customer, Consumer, SerialNumber],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy()
});
