import { AppDataSource } from "./data-source";
import app from "./app";
import logger from "./helpers/logger.helper";

const { PORT = "3000" } = process.env;

AppDataSource.initialize()
  .then(async () => {
    logger.info("Data Source has been initialized");
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error(error));
