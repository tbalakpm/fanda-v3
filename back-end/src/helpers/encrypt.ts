import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

const { JWT_SECRET = "" } = process.env;

export class encrypt {
  static async encryptPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }

  static async comparePassword(hashPassword: string, password: string) {
    return await bcrypt.compare(password, hashPassword);
  }

  static generateToken(payload: jwt.JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  }
}
