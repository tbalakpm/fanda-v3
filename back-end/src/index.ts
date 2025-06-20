import 'dotenv/config';

import { AppDataSource } from './data-source';
import app from './app';
import logger from './logger';
import { createAdminUser } from './data-seed/admin-user.data-seed';

const { PORT = '4000' } = process.env;

AppDataSource.initialize()
  .then(async (db) => {
    logger.info('Data Source has been initialized');

    await createAdminUser(db);

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => logger.error('Error while initializing data source:', error));
