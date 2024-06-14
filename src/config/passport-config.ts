import passport from "passport";
import localStrategy from "../auth/login-strategies/local.strategy"; // Import the local strategy
import { UserModel } from "../models/UserModel"; // Import the User model

// Serialize the user into the session
passport.serializeUser((user: any, done) => {
  // Here, we're storing the user id in the session
  done(null, user.id);
});

// Deserialize the user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    // Find the user by their id and pass it to done
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    // Handle any errors that occur during deserialization
    done(error);
  }
});

// Use the local strategy
passport.use(localStrategy);
// You can add more strategies here as needed
