import express, { Request, Response } from "express";
import "dotenv/config"; // Import and configure dotenv to load environment variables
import path from "path";
import viewsCounter from "../controllers/views-counter";
import authGuard from "../middleware/auth-guard";
import upload from "../config/multer-config";
import createNewPost from "../controllers/create-new-post";

const router = express.Router();

router.route("/api/views").get(viewsCounter);
router
  .route("/api/post")
  .post(authGuard, upload.single("image"), createNewPost);

export default router;
