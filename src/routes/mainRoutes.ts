import express, { Request, Response } from "express";
import "dotenv/config"; // Import and configure dotenv to load environment variables
import path from "path";
import viewsCounter from "../controllers/views-counter";
import authGuard from "../middleware/auth-guard";
import upload from "../config/multer-config";
import createNewPost from "../controllers/create-new-post";

const router = express.Router();

router.route("/api/views").get(viewsCounter);
router.route("/api/post").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createNewPost,
);

router.route("/protected").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    msg: "User authenticated wtih a session",
    user: req.user,
  });
});

export default router;
