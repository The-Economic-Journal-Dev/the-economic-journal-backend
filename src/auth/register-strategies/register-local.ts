import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { UserModel } from "../../models/UserModel";
import validateRegister from "../../utils/schema-validator";
import sendEmailToValidate from "../../utils/email-validator";
import {
  EmailVerificationTokenModel,
  IEmailVerificationToken,
} from "../../models/EmailVerifictionTokenModel";
import upload from "../../config/multer-config";

// Register middleware
const localRegisterMethod = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, password, confirmPassword } = req.body;
  console.log(
    "Local Register middleware started with: ",
    email,
    username,
    password,
    confirmPassword,
  );

  const schemaValidationResult = validateRegister({
    email,
    username,
    password,
    confirmPassword,
  });

  if (schemaValidationResult.status !== StatusCodes.OK) {
    return res
      .status(schemaValidationResult.status)
      .json({ msg: schemaValidationResult.msg });
  }

  try {
    // Check if email or username already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      // If the user already exists, send a 400 Bad Request response
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email or username already exists" });
    }

    // Create a new user if email and username are unique
    const newUser = new UserModel({ email, username, password });

    const emailValidationResult = await sendEmailToValidate(email);

    if (!emailValidationResult.success) {
      return res
        .status(emailValidationResult.status as number)
        .json({ msg: emailValidationResult.msg });
    }

    const session = await UserModel.startSession();
    session.startTransaction();

    try {
      await newUser.save({ session });

      const emailVerificationTokenDoc: IEmailVerificationToken =
        new EmailVerificationTokenModel({
          userId: newUser._id,
          token: emailValidationResult.verificationToken,
          code: emailValidationResult.verificationCode,
        });

      await emailVerificationTokenDoc.save({ session });

      await session.commitTransaction();

      req.login(newUser, (error) => {
        if (error) {
          return next(error);
        }
        console.log("User logged in:", req.user);
        return next();
      });

      console.log("Register middleware finished");
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    console.log("Register middleware finished");
    // Call the next middleware or route handler
    return next();
  } catch (error) {
    // Handle any errors that occur during user creation
    return next(error); // Pass the error to the error-handling middleware
  }
};

export { localRegisterMethod };
export default [upload.none(), localRegisterMethod];
