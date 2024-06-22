import express, { Request, Response } from "express";
import "dotenv/config"; // Import and configure dotenv to load environment variables
import viewsCounter from "../controllers/views-counter";
import authGuard from "../middleware/auth-guard";
import createNewPost from "../controllers/create-new-post";
import getAllPosts from "../controllers/get-all-posts";

const router = express.Router();

router.route("/api/views").get(viewsCounter);
router.route("/api/post").post(createNewPost).get(getAllPosts);

router.route("/protected").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    msg: "User authenticated wtih a session",
    user: req.user,
  });
});

export default router;
