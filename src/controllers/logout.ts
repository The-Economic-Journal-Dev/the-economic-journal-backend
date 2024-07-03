import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// Logout controller
const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: true, message: "Logout unsuccessful" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logout successful" });
    });
  } else {
    res.end();
  }
};

export default logout;
