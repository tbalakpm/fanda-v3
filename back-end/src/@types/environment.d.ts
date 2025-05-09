declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      CORS_ORIGINS: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      DB_TYPE: 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'better-sqlite3' | 'mssql' | 'mongodb';
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      TZ: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
