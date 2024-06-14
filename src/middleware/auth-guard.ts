import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware/route handler
    return next();
  } else {
    // User is not authenticated, respond with 401 Unauthorized
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      msg: "Unauthorized: Authentication required to access this route",
    });
  }
};

export default authGuard;
