import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { User, Company } from "./entities";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Year } from "./modules/financial-year/year.entity";
import { Unit } from "./modules/unit/unit.entity";
import { ProductCategory } from "./modules/product-category/product-category.entity";

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: process.env.NODE_ENV === "development" ? true : false,
  entities: [User, Company, Year, Unit, ProductCategory],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy()
});
