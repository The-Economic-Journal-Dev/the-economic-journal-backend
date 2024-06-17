import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const checkSession = (req: Request, res: Response) => {
  if (req.session) {
    res.json({
      success: true,
      msg: "Session is active",
      userId: req.session.user,
    });
  } else {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, msg: "No active session" });
  }
};

export default checkSession;
