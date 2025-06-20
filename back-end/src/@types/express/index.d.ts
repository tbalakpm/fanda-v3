// import * as jwt from "jsonwebtoken";
// import { User } from "../../entity/user.entity";

import type { User } from '../../entities/user.entity';

declare global {
  interface ImportMeta {
    url: string;
    main: boolean;
  }

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

  interface JwtPayload {
    userId?: string;
  }

  namespace Express {
    interface Request {
      // jwtPayload?: string | jwt.JwtPayload;
      currentUser?: User; //Record<string, any>;
    }
    interface Response {
      timeTakenMs?: number;
    }
  }
}
