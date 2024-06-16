import LoginAuthenticationFactory from "../auth/login-method-factory";
import logout from "../controllers/logout";
import RegisterMethodFactory from "../auth/register-method-factory";
import regenerateSession from "../middleware/regenerateSession";
import authGuard from "../middleware/auth-guard";
import { Request, Response } from "express";
import validateEmail from "../controllers/validate-email";

import express from "express";
const router = express.Router();

router
  .route("/register/:method")
  .post(RegisterMethodFactory, authGuard, (req: Request, res: Response) => {
    res.status(200).json({ success: true, msg: "Register successful" });
  });
router
  .route("/login/:method")
  .get(
    LoginAuthenticationFactory,
    regenerateSession,
    authGuard,
    (req: Request, res: Response) => {
      res.status(200).json({ success: true, msg: "Login successful" });
    },
  );
router.route("/logout").delete(authGuard, logout);

router.route("/verify").post(validateEmail);

export default router;
