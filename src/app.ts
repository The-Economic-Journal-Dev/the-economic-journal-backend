import "dotenv/config"; // Import and configure dotenv to load environment variables
import "express-async-errors"; // Import express-async-errors for better error handling
import compression from "compression"; // Import compression for compressing responses

import express from "express"; // Import Express
const app = express(); // Create an Express application

import connectToDB from "./db/connect"; // Import the database connection function
import session from "express-session";
import { sessionStorage } from "./db/connect"; // Import the session storage configuration

import passport from "passport";

import authRoutes from "./routes/authRoutes"; // Import authorization routes
import mainRoutes from "./routes/mainRoutes"; // Import the main routes serving the HTML

import path from "path"; // Import path to use for file path for compatibility with different operating systems
import cors from "cors"; // Import CORS

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

// Middleware to use CORS
app.use(cors());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(process.env.BASE_DIR!, "public")));

// Connect to mongo db
connectToDB(process.env.MONGO_URI!);

// Setup mongo store for session

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

const port = process.env.PORT || 3000; // Set the port from the environment variable or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
