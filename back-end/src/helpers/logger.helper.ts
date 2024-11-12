import { createLogger, format, transports } from "winston";
import process from "node:process";

const { combine, timestamp, label, prettyPrint, printf, colorize, align } = format;
const myFormat = printf(({ timestamp, label, level, message }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  // level: "info",
  format: combine(label({ label: "fanda-v3" }), timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS+05:30" }), format.json(), prettyPrint()),
  transports: [new transports.File({ filename: "./logs/error.log", level: "warn" })]
});
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize({ all: true }), label({ label: "fanda-v3" }), timestamp({ format: "HH:mm:ss.SSS" }), myFormat, align()),
      level: "info"
    })
  ); //
}
export default logger;

// {
//  format: winston.format.simple()
// }
