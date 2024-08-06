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
import apiRoutes from "./routes/apiRoutes"; // Import the main routes serving the HTML
import helmet from "helmet";
import cors from "cors";

// Use Helmet!
app.use(helmet());
app.use(
  cors({
    origin: ["https://www.derpdevstuffs.org", "https://derpdevstuffs.org"],
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middlewares to parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hello World!</title>
        </head>
        <body>
            <h1>Hello World!</h1>
        </body>
        </html>
    `;
  res.send(htmlContent);
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

app.use(errorHandler);

const startApp = async () => {
  // Connect to mongo db
  connectToDB(process.env.MONGO_URI!);

  // Ensure cache is initialized
  await initializeCache();

  // Your existing Express setup and route handlers here

  const port = process.env.SERVER_PORT || 3000; // Set the port from the environment variable or default to 3000
  app.listen(port, () => {
    logger.info(`Server is running on port ${port} on ${process.env.NODE_ENV}`);
  });
};

// Immediately invoked async function expression (IIFE) to handle top-level await
(async () => {
  await startApp();
})();
