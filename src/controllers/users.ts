// IMPORTANT: This code is deprecated in favor of using firebase in the frontend instead

// import { Request, Response } from "express";
// import { authenticateFirebaseId } from "../auth/authenticate-firebase-cred";
// import { StatusCodes } from "http-status-codes";
// import { UserModel, IUser } from "../models/UserModel";
// import bcryptjs from "bcryptjs";
// import upload from "../config/multer-config";
// import { uploadFileToS3 } from "../services/aws/s3-file-manager";

// // Define the types for files
// interface MulterFiles {
//   [fieldname: string]: Express.Multer.File[];
// }

// /**
//  * Checks if the mimetype is one of the accepted image types (gif, jpg, jpeg, png).
//  * @param {string} mimetype - The mimetype to check.
//  * @returns {boolean} True if the mimetype is an accepted image type, false otherwise.
//  */
// function isAcceptedMimetype(mimetype: string): boolean {
//   const acceptedImagePattern = /^image\/(gif|jpg|jpeg|png)$/;
//   return acceptedImagePattern.test(mimetype);
// }

// const editUserProfile = [
//   authenticateFirebaseId,
//   upload.fields([
//     {
//       name: "image",
//       maxCount: 1,
//     },
//   ]),
//   async (req: Request, res: Response): Promise<void> => {
//     const { displayName } = req.body; // New profile data from request body
//     const userId = (req.user as any)._id; // Assuming req.user is populated with user info

//     const files = req.files as MulterFiles;

//     let imageUrl = "";
//     const image = files["image"][0];
//     if (image) {
//       if (!isAcceptedMimetype(image.mimetype)) {
//         throwError(
//           `Invalid mimetype for file ${image.filename}.`,
//           StatusCodes.BAD_REQUEST,
//         );
//       }
//       imageUrl = await uploadFileToS3(image);
//       newProfile.profilePictureUrl = imageUrl;
//     }

//     // Check if the newProfile contains a password
//     if (!newProfile.password) {
//       throwError(
//         "Password is required for profile update.",
//         StatusCodes.BAD_REQUEST,
//       );
//     }

//     // Find the user by ID
//     const user: IUser | null =
//       await UserModel.findById(userId).select("+password");

//     if (!user) {
//       throwError(
//         `User ${(req.user as any).username} is not authorised for this action.`,
//         StatusCodes.UNAUTHORIZED,
//       );
//     }

//     // Verify password
//     const isPasswordValid = await bcryptjs.compare(
//       newProfile.password!,
//       user!.password,
//     );

//     if (!isPasswordValid) {
//       throwError(`Invalid password.`, StatusCodes.UNAUTHORIZED);
//     }

//     // Update the user's profile fields
//     Object.keys(newProfile).forEach((key) => {
//       if (key !== "password") {
//         (user as any)[key] = (newProfile as any)[key];
//       }
//     });

//     // Save the updated user profile
//     const updatedUser = await user!.save();

//     // Send updated user profile as response
//     res.status(StatusCodes.OK).json({
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });
//   },
// ];

// const deleteUser = [
//   authGuard,
//   async (req: Request, res: Response) => {
//     const { password } = req.body;
//     const userId = (req.user as any)._id; // Assuming req.user is populated with user info

//     // Check if the newProfile contains a password
//     if (!password) {
//       throwError(
//         "Password is required for account deletion.",
//         StatusCodes.BAD_REQUEST,
//       );
//     }

//     // Find the user by ID
//     const user: IUser | null =
//       await UserModel.findById(userId).select("+password");

//     // Verify password
//     const isPasswordValid = await bcryptjs.compare(password, user!.password);

//     if (!isPasswordValid) {
//       throwError(`Invalid password.`, StatusCodes.UNAUTHORIZED);
//     }

//     // Delete the user
//     await user!.remove();

//     res.json({
//       success: true,
//       message: "User deleted successfully!",
//       user: null,
//     });
//   },
// ];

// const getUserProfile = async (req: Request, res: Response) => {
//   const { userId } = req.params;

//   const user = await UserModel.findById(userId);

//   res.status(StatusCodes.OK).json({
//     success: true,
//     user,
//   });
// };

// const changeUserPassword = async (req: Request, res: Response) => {
//   const { email, username, oldPassword, newPassword, confirmNewPassword } =
//     req.body;

//   // Check if all required fields are provided
//   if (!username || !oldPassword || !newPassword || !confirmNewPassword) {
//     throwError("Required fields are missing", StatusCodes.BAD_REQUEST);
//   }

//   if (newPassword !== confirmNewPassword) {
//     throwError(
//       "New password and confirmation do not match.",
//       StatusCodes.BAD_REQUEST,
//     );
//   }

//   // Find the user by ID
//   // Find the user by username or email
//   const user: IUser | null = await UserModel.findOne({
//     $or: [{ username: username }, { email: email }],
//   }).select("+password");

//   if (!user) {
//     throwError(
//       `User not found or not authorized for this action.`,
//       StatusCodes.UNAUTHORIZED,
//     );
//   }

//   // Verify old password
//   const isPasswordValid = await bcryptjs.compare(oldPassword, user!.password);

//   if (!isPasswordValid) {
//     throwError(`Invalid password.`, StatusCodes.UNAUTHORIZED);
//   }

//   // Update the user's password
//   user!.password = newPassword;

//   // Save the updated user
//   await user!.save();

//   res.json({
//     success: true,
//     message: "Password changed successfully",
//   });
// };

// export {
//   activateUser,
//   editUserProfile,
//   deleteUser,
//   getUserProfile,
//   changeUserPassword,
// };

import { StatusCodes } from "http-status-codes";
import admin from "../services/firebase/firebase-admin-client";
import { Request, Response } from "express";

const getUserFromUid = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    // Fetch user record by UID
    const userRecord = await admin.auth().getUser(uid);

    // Access username from userRecord (assuming it is a custom claim or user attribute)
    // If the username is stored in custom claims, it would be accessible like this:
    const username = userRecord.displayName;

    if (!username) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ success: false, message: "User does not have a display name" });
    }

    // Send response
    res.json({ uid: userRecord.uid, displayName: username });
  } catch (error) {
    console.error("Error fetching user data:", error);
    throwError("Error fetching user data", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export { getUserFromUid };
