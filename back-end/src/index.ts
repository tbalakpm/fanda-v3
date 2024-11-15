import "dotenv/config";

import { AppDataSource } from "./data-source";
import app from "./app";
import logger from "./logger";
import { createAdminUser } from "./data-seed/admin-user.data-seed";
// import { SerialNumberHelper } from "./helpers/serial-number.helper";

const { PORT = "4000" } = process.env;

AppDataSource.initialize()
  .then(async (db) => {
    logger.info("Data Source has been initialized");

    await createAdminUser(db);

    // const current_serial = await SerialNumberHelper.getNextSerial("stock", "01932b09-e344-7998-9a52-06521371f6ad");
    // console.log("current_serial", current_serial);

    // const next_serial = await SerialNumberHelper.getNextRangeSerial(5, "stock", "01932b09-e344-7998-9a52-06521371f6ad");
    // console.log("next_serial", next_serial);

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => logger.error(error));
