import { StatusCodes } from "http-status-codes";
import { auth } from "../services/firebase/firebase-admin-client";
import { NextFunction, Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

const authenticateFirebaseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  let idToken;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    idToken = authHeader.substring(7, authHeader.length);
  } else {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Invalid or Missing Authentication Header",
    });
  }

  try {
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      role: decodedToken.role, // Assuming 'role' is a custom claim
    };
  } catch (error) {
    logger.error(error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Invalid token" });
  }
  next();
};

const verifyRole = (requiredRole: String[]) => {
  return [
    authenticateFirebaseId,
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized: User not authenticated",
        });
      }

      if (requiredRole && requiredRole.includes((req.user as any).role)) {
        next();
      } else {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Unauthorized: User does not have the required role",
        });
      }
    },
  ];
};

export { authenticateFirebaseId, verifyRole };
