import "dotenv/config"; // Import and configure dotenv to load environment variables
import "express-async-errors"; // Import express-async-errors for better error handling
import "./utils/throw-error-utils";
import errorHandler from "./middleware/error-handler";
import compression from "compression"; // Import compression for compressing responses

import express from "express"; // Import Express
const app = express(); // Create an Express application

import connectToDB from "./db/connect"; // Import the database connection function
import session from "express-session";
import { sessionStorage } from "./db/connect"; // Import the session storage configuration

import passport from "passport";

import authRoutes from "./routes/authRoutes"; // Import authorization routes
import mainRoutes from "./routes/mainRoutes"; // Import the main routes serving the HTML
import apiRoutes from "./routes/apiRoutes"; // Import the main routes serving the HTML
import helmet from "helmet";
import cors from "cors";

// Use Helmet!
app.use(helmet());
app.use(cors());

// Middleware to compress responses from the server
app.use(
  compression({
    level: 6,
    threshold: 10 * 1000, // Compress responses larger than 10KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Middlewares to parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to mongo db
connectToDB(process.env.MONGO_URI!);

// Init session using the mongo store
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStorage,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 2 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Import and configure Passport
import "./config/passport-config";

// Import and configure Register
import "./config/register-config";

// Routes
app.use(mainRoutes);
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

app.use(errorHandler);

const port = process.env.SERVER_PORT || 3000; // Set the port from the environment variable or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port} on ${process.env.NODE_ENV}`);
});
