import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const checkSession = (req: Request, res: Response) => {
  if (req.session) {
    res.json({
      success: true,
      message: "Session is active",
      user: req.user,
    });
  } else {
    throwError("No active session", StatusCodes.UNAUTHORIZED);
  }
};

export default checkSession;
