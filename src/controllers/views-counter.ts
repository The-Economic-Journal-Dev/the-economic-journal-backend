import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const viewsCounter = (req: Request, res: Response) => {
  // Ensure req.session is defined before accessing it
  if (!req.session) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Session not available" });
  }

  // Initialize views counter if not already initialized
  if (!req.session.views) {
    req.session.views = 0;
  }

  // Increment the views counter
  req.session.views++;

  // Respond with the current view count and username
  res.json({ views: req.session.views, username: req.user! });
};

export default viewsCounter;
