import express, { Request, Response } from "express";

import authGuard from "../middleware/auth-guard";

const router = express.Router();
router.route("/protected").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "User authenticated with a session",
    user: req.user,
  });
});

export default router;
