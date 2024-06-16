import express, { Request, Response } from "express";
import "dotenv/config"; // Import and configure dotenv to load environment variables
import path from "path";
import viewsCounter from "../controllers/views-counter";
import authGuard from "../middleware/auth-guard";
import uploadFileToS3 from "../controllers/upload-file-to-s3";
import upload from "../config/multer-config";

const router = express.Router();

router.route("/api/views").get(viewsCounter);
router
  .route("/api/blog/upload")
  .post(authGuard, upload.array("photos", 12), uploadFileToS3);

router.route("/").get((req: Request, res: Response) => {
  res.sendFile(path.join(process.env.BASE_DIR!, "public", "index.html"));
});
router.route("/dashboard").get(authGuard, (req: Request, res: Response) => {
  res.sendFile(path.join(process.env.BASE_DIR!, "public", "dashboard.html"));
});
router.route("/verify").get((req: Request, res: Response) => {
  res.sendFile(path.join(process.env.BASE_DIR!, "public", "verify-email.html"));
});

export default router;
