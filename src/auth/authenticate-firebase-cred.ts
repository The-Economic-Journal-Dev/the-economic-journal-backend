import { StatusCodes } from "http-status-codes";
import { auth } from "../services/firebase/firebase-admin-client";
import { NextFunction, Request, Response } from "express";

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
    throwError(
      "Invalid or Missing Authentication Header",
      StatusCodes.FORBIDDEN,
    );
  }

  auth
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.displayName,
        role: decodedToken.role, // Assuming 'role' is a custom claim
      };
      next();
    })
    .catch((error) => {
      throwError("Invalid token", StatusCodes.UNAUTHORIZED);
    });
};

const verifyRole = (requiredRole: String[]) => {
  return [
    authenticateFirebaseId,
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return throwError(
          "Unauthorized: User not authenticated",
          StatusCodes.UNAUTHORIZED,
        );
      }

      if (requiredRole.includes((req.user as any).role)) {
        next();
      } else {
        throwError(
          "Unauthorized: User does not have the required role",
          StatusCodes.FORBIDDEN,
        );
      }
    },
  ];
};

export { authenticateFirebaseId, verifyRole };
