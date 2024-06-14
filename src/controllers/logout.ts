import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// Logout controller
const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(StatusCodes.BAD_REQUEST).send("Unable to log out");
      } else {
        res.send("Logout successful");
      }
    });
  } else {
    res.end();
  }
};

export default logout;
