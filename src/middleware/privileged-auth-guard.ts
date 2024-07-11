import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  console.log("Session data: ", req.session);
  if (req.isAuthenticated()) {
    console.log("User: ", req.user);
    // User is authenticated, proceed to the next middleware/route handler
    return next();
  } else {
    throwError(
      "Unauthorized: Authentication required to access this route",
      StatusCodes.UNAUTHORIZED,
    );
  }
};

export default authGuard;
