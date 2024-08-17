import "dotenv/config"; // Import and configure dotenv to load environment variables
import "express-async-errors"; // Import express-async-errors for better error handling
import "./utils/throw-error-utils";
import "./config/logger-config";

import errorHandler from "./middleware/error-handler";

import express, { Request, Response } from "express"; // Import Express
const app = express(); // Create an Express application

import connectToDB from "./db/connect"; // Import the database connection function
import { initializeCache } from "./utils/cache-utils";

import { authenticateFirebaseId } from "./auth/authenticate-firebase-cred";
import apiRoutes from "./routes/api-routes"; // Import the main routes serving the HTML
import helmet from "helmet";
import userRouter from "./routes/user-routes";

// Use Helmet!
app.use(helmet());

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", ["Content-Type", "Authorization"]);
  // Allow any origin in development
  if (process.env.NODE_ENV === "development") {
    res.append("Access-Control-Allow-Origin", "*");
    next();
  } else {
    res.append("Access-Control-Allow-Origin", "https://theeconomicjournal.org");
    next();
  }
});

// Middlewares to parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  res.json({ success: true, headers: res.header });
});

app.get(
  "/protected",
  authenticateFirebaseId,
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "User authenticated with a session",
      user: req.user,
    });
  },
);

app.use("/articles", apiRoutes);
app.use("/users", userRouter);

app.use(errorHandler);

const startApp = async () => {
  // Connect to mongo db
  connectToDB(process.env.MONGO_URI!);

  // Ensure cache is initialized
  await initializeCache();

  const port = process.env.SERVER_PORT || 3000; // Set the port from the environment variable or default to 3000
  app.listen(port, () => {
    logger.info(`Server is running on port ${port} on ${process.env.NODE_ENV}`);
  });
};

// Immediately invoked async function expression (IIFE) to handle top-level await
(async () => {
  await startApp();
})();
