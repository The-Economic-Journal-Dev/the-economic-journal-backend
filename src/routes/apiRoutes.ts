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
import {
  deleteUser,
  editUserProfile,
  getUserProfile,
} from "../controllers/users";
import { createNewComment, deleteComment } from "../controllers/comments";

const commentRouter = express.Router();
commentRouter.route("/comment").post(createNewComment).delete(deleteComment);

const router = express.Router();

router.route("/views").get(authGuard, viewsCounter);

router.route("/posts").post(createNewPost).get(getPosts);
router.route("/post/:id").get(getSinglePost).patch(editPost).delete(deletePost);
router.use("/post/:id", commentRouter);

router
  .route("/user/:id")
  .patch(editUserProfile)
  .delete(deleteUser)
  .get(getUserProfile);

export default router;
