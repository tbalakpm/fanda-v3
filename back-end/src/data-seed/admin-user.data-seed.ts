import { DataSource } from "typeorm";
import { User } from "../entities";
import { encrypt } from "../helpers";

export const createAdminUser = async (ds: DataSource) => {
  const userRepo = ds.getRepository<User>(User);
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
