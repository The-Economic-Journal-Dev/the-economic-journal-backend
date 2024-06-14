import { Request, Response, NextFunction } from "express";

// Define middleware to regenerate session after login
const regenerateSession = (req: Request, res: Response, next: NextFunction) => {
  console.log("regenerateSession called");
  req.session.regenerate((err) => {
    if (err) {
      console.error("Error regenerating session:", err);
    }
    // Call next middleware or handle any other logic after session regeneration
    next();
  });
};

export default regenerateSession;
