import "dotenv/config"; // Import and configure dotenv to load environment variables
import "express-async-errors"; // Import express-async-errors for better error handling
import "./utils/throw-error-utils";
import "./config/logger-config";

import errorHandler from "./middleware/error-handler";

import express from "express"; // Import Express
const app = express(); // Create an Express application

import connectToDB from "./db/connect"; // Import the database connection function

import mainRoutes from "./routes/mainRoutes"; // Import the main routes serving the HTML
import apiRoutes from "./routes/apiRoutes"; // Import the main routes serving the HTML
import helmet from "helmet";
import cors from "cors";

// Use Helmet!
app.use(helmet());
app.use(cors());

// Middlewares to parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to mongo db
connectToDB(process.env.MONGO_URI!);

// Routes
app.use(mainRoutes);
app.use(apiRoutes);

app.use(errorHandler);

const port = process.env.SERVER_PORT || 3000; // Set the port from the environment variable or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port} on ${process.env.NODE_ENV}`);
});
