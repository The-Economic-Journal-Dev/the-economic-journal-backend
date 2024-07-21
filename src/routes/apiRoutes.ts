import express, { Request, Response } from "express";
import {
  authenticateFirebaseId,
  verifyRole,
} from "../auth/authenticate-firebase-cred";
import {
  createNewPost,
  getPosts,
  getSinglePost,
  editPost,
  deletePost,
} from "../controllers/posts";
import { createNewComment, deleteComment } from "../controllers/comments";

const commentRouter = express.Router();
commentRouter.route("/comment").post(createNewComment).delete(deleteComment);

const router = express.Router();

router
  .route("/posts")
  .post(verifyRole(["writer", "admin"]), createNewPost)
  .get(getPosts);
router
  .route("/post/:id")
  .get(getSinglePost)
  .patch(verifyRole(["writer", "admin"]), editPost)
  .delete(verifyRole(["writer", "admin"]), deletePost);
router.use("/post/:id", commentRouter);

export default router;
