// import * as jwt from "jsonwebtoken";
import { User } from "../../entity/user.entity";

declare global {
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
