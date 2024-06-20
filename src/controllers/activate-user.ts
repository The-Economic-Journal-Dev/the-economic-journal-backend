import { Request, Response } from "express";
import {
  EmailVerificationTokenModel,
  IEmailVerificationToken,
} from "../models/EmailVerifictionTokenModel";
import { StatusCodes } from "http-status-codes";
import { UserModel, IUser } from "../models/UserModel";

/**
 * Validates an email using a verification token and code, activates the user if valid.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const activateUser = async (req: Request, res: Response) => {
  console.log("Email validation called");
  const { token } = req.query;
  const { code } = req.body;

  const emailVerificationToken = await EmailVerificationTokenModel.findOne({
    token,
  });

  if (!emailVerificationToken) {
    return throwError(
      "Invalid token or token doesn't exist",
      StatusCodes.NOT_FOUND,
    );
  }

  const isCodeValid = emailVerificationToken.code === code;
  if (!isCodeValid) {
    return throwError("Invalid code", StatusCodes.BAD_REQUEST);
  }

  // Find and update the user to set their active status to true
  await UserModel.findOneAndUpdate(
    { _id: emailVerificationToken.userId }, // Assuming emailVerificationToken contains userId
    { active: true },
  );

  // Delete the email verification token after successful verification
  await EmailVerificationTokenModel.deleteOne({ token });

  return res.status(StatusCodes.OK).json({
    success: true,
    msg: "Email validation successful",
  });
};

export default activateUser;
