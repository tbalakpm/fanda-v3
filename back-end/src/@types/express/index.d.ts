// import * as jwt from "jsonwebtoken";
// import { User } from "../../entity/user.entity";

import { User } from '../../entities/user.entity';

declare global {
  interface ImportMeta {
    url: string;
    main: boolean;
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

export {};
