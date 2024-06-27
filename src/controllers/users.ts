import { Request, Response } from "express";
import {
  EmailVerificationTokenModel,
  IEmailVerificationToken,
} from "../models/EmailVerifictionTokenModel";
import { StatusCodes } from "http-status-codes";
import { UserModel, IUser } from "../models/UserModel";
import bcryptjs from "bcryptjs";
import upload from "../config/multer-config";
import uploadFileToS3 from "../utils/upload-file-to-s3";
import authGuard from "../middleware/auth-guard";

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

// TypeScript interface to define the schema fields
interface IUserEdit {
  email?: string;
  username?: string;
  password?: string;
  profilePictureUrl?: string;
}

// Define the types for files
interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

/**
 * Checks if the mimetype is one of the accepted image types (gif, jpg, jpeg, png).
 * @param {string} mimetype - The mimetype to check.
 * @returns {boolean} True if the mimetype is an accepted image type, false otherwise.
 */
function isAcceptedMimetype(mimetype: string): boolean {
  const acceptedImagePattern = /^image\/(gif|jpg|jpeg|png|html)$/;
  return acceptedImagePattern.test(mimetype);
}

const editUserProfile = [
  authGuard,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const newProfile: IUserEdit = req.body; // New profile data from request body
    const userId = (req.user as any)._id; // Assuming req.user is populated with user info

    const files = req.files as MulterFiles;

    let imageUrl = "";
    const image = files["image"][0];
    if (image) {
      if (!isAcceptedMimetype(image.mimetype)) {
        throwError(
          `Invalid mimetype for file ${image.filename}.`,
          StatusCodes.BAD_REQUEST,
        );
      }
      imageUrl = await uploadFileToS3(image);
      newProfile.profilePictureUrl = imageUrl;
    }

    // Check if the newProfile contains a password
    if (!newProfile.password) {
      throwError(
        "Password is required for profile update.",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Find the user by ID
    const user: IUser | null =
      await UserModel.findById(userId).select("+password");

    if (!user) {
      throwError(
        `User ${(req.user as any).username} is not authorised for this action.`,
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(
      newProfile.password!,
      user!.password,
    );

    if (!isPasswordValid) {
      throwError(`Invalid password.`, StatusCodes.UNAUTHORIZED);
    }

    // Update the user's profile fields
    Object.keys(newProfile).forEach((key) => {
      if (key !== "password") {
        (user as any)[key] = (newProfile as any)[key];
      }
    });

    // Save the updated user profile
    const updatedUser = await user!.save();

    // Send updated user profile as response
    res.status(StatusCodes.OK).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  },
];

const deleteUser = [
  authGuard,
  async (req: Request, res: Response) => {
    const { password } = req.body;
    const userId = (req.user as any)._id; // Assuming req.user is populated with user info

    // Check if the newProfile contains a password
    if (!password) {
      throwError(
        "Password is required for account deletion.",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Find the user by ID
    const user: IUser | null =
      await UserModel.findById(userId).select("+password");

    if (!user) {
      throwError(
        `User ${(req.user as any).username} is not authorised for this action.`,
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user!.password);

    if (!isPasswordValid) {
      throwError(`Invalid password.`, StatusCodes.UNAUTHORIZED);
    }

    // Delete the user
    await user!.remove();
  },
];

const getUserProfile = (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = UserModel.findById(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
};

export { activateUser, editUserProfile, deleteUser, getUserProfile };
