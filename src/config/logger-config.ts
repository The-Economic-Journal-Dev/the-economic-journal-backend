import path from "path";
import pino, { Logger } from "pino";
import fs from "fs";

let logger;

// Path to the log file
const logFilePath = path.join(__dirname, "app.log");

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
  // Create a writable stream for the log file
  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  logger = pino(
    {
      level: "info",
      redact: ["password", "secret"],
    },
    logStream,
  );
}

// Example logging
logger.info("Application started");
logger.warn("This is a warning message");
logger.error("This is an error message");

declare global {
  var logger: Logger;
}

// Attach the logger to the global object
(global as any).logger = logger;

// Use this code to run the application and test logging
// In a separate terminal, run: tail -f app.log to monitor logs

export default logger;
