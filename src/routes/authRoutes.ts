import LoginAuthenticationFactory from "../auth/login-method-factory";
import logout from "../controllers/logout";
import RegisterMethodFactory from "../auth/register-method-factory";
import regenerateSession from "../middleware/regenerateSession";
import authGuard from "../middleware/auth-guard";
import { Request, Response } from "express";
import { activateUser, changeUserPassword } from "../controllers/users";
import checkSession from "../controllers/check-session";
import upload from "../config/multer-config";

import express from "express";
import { StatusCodes } from "http-status-codes";
const router = express.Router();

router
  .route("/register/:method")
  .post(
    upload.none(),
    RegisterMethodFactory,
    authGuard,
    (req: Request, res: Response) => {
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "Register successful" });
    },
  );
router
  .route("/login/:method")
  .post(
    upload.none(),
    LoginAuthenticationFactory,
    regenerateSession,
    authGuard,
    (req: Request, res: Response) => {
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "Login successful" });
    },
  );
router.route("/logout").delete(authGuard, logout);

router.route("/verify").post(activateUser);
router.route("/changepassword").post(changeUserPassword);

router.route("/check-session").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "User authenticated with a session",
    user: req.user,
  });
});

export default router;
