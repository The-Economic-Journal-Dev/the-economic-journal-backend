import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import { UserModel, IUser } from "../../models/UserModel";
import bcryptjs from "bcryptjs";

// Define the verify callback function
const verifyCallback: VerifyFunction = async (username, password, done) => {
  try {
    console.log(`Local login strategy started for user ${username}`);

    // Ensure identifier (email or username) and password are provided
    if (!username || !password) {
      return done(null, false, {
        message: "Identifier and password are required.",
      });
    }

    // Find the user by email or username
    const user: IUser | null = await UserModel.findOne({
      $or: [{ email: username }, { username }],
    }).select("+password");

    if (!user) {
      return done(null, false, {
        message: "Invalid email or username and password.",
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return done(null, false, {
        message: "Invalid email or username and password.",
      });
    }

    // Return the user if credentials are correct
    return done(null, user);
  } catch (error: Error | any) {
    console.log("Local login strategy error detected: " + error.message);
    return done(error);
  } finally {
    console.log("Local login strategy finished");
  }
};

// Create the local strategy
const localStrategy = new LocalStrategy(verifyCallback);

export default localStrategy;
