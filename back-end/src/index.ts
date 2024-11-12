import { DataSource } from "typeorm";
import process from "node:process";
import "dotenv/config";

import { AppDataSource } from "./data-source";
import app from "./app";
import logger from "./helpers/logger.helper";
import { User } from "./entities/user.entity";
import { encrypt } from "./helpers/encrypt.helper";

const { PORT = "4000" } = process.env;

AppDataSource.initialize()
  .then(async (db) => {
    logger.info("Data Source has been initialized");

    await createAdminUser(db);

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => logger.error(error));

const createAdminUser = async (db: DataSource) => {
  const userRepo = db.getRepository<User>(User);
  const adminUserFound = await userRepo.existsBy({ username: "admin" });
  if (!adminUserFound) {
    const adminUser = new User();
    adminUser.userId = "0192fc5e-0093-7ccc-a20a-dc844a5bad1c";
    adminUser.username = "admin";
    adminUser.password = await encrypt.encryptPassword("Welcome!23");
    adminUser.role = "admin";
    await userRepo.save(adminUser);
  }
};
