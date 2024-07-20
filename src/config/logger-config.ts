import pino, { Logger } from "pino";

let logger;

if (process.env.NODE_ENV === "development") {
  logger = pino({
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });
} else {
  logger = pino({
    level: "info",
    redact: ["password", "secret"],
  });
}

logger.info("Hello, Logs!");

declare global {
  var logger: Logger;
}

// Attach the logger to the global object
(global as any).logger = logger;

module.exports = logger;
