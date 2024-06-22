import express, { Request, Response } from "express";
import viewsCounter from "../controllers/views-counter";
import authGuard from "../middleware/auth-guard";
import {
  createNewPost,
  getPosts,
  getSinglePost,
  editPost,
  deletePost,
} from "../controllers/posts";

const router = express.Router();

router.route("/api/views").get(viewsCounter);
router.route("/api/post").post(createNewPost).get(getPosts);
router
  .route("/api/post/:id")
  .get(getSinglePost)
  .patch(editPost)
  .delete(deletePost);

router.route("/protected").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    msg: "User authenticated with a session",
    user: req.user,
  });
});

export default router;
