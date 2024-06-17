import LoginAuthenticationFactory from "../auth/login-method-factory";
import logout from "../controllers/logout";
import RegisterMethodFactory from "../auth/register-method-factory";
import regenerateSession from "../middleware/regenerateSession";
import authGuard from "../middleware/auth-guard";
import { Request, Response } from "express";
import activateUser from "../controllers/activate-user";
import checkSession from "../controllers/check-session";

import express from "express";
import { StatusCodes } from "http-status-codes";
const router = express.Router();

router
  .route("/register/:method")
  .post(RegisterMethodFactory, authGuard, (req: Request, res: Response) => {
    res
      .status(StatusCodes.OK)
      .json({ success: true, msg: "Register successful" });
  });
router
  .route("/login/:method")
  .get(
    LoginAuthenticationFactory,
    regenerateSession,
    authGuard,
    (req: Request, res: Response) => {
      res
        .status(StatusCodes.OK)
        .json({ success: true, msg: "Login successful" });
    },
  );
router.route("/logout").delete(authGuard, logout);

router.route("/verify").post(activateUser);

router.route("/check-session").get(checkSession);

export default router;
