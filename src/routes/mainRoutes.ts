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

const router = express.Router();

router.route("/api/views").get(authGuard, viewsCounter);
router.route("/api/posts").post(authGuard, createNewPost).get(getPosts);
router
  .route("/api/post/:id")
  .get(getSinglePost)
  .patch(authGuard, editPost)
  .delete(authGuard, deletePost);

router
  .route("/api/user/:id")
  .patch(authGuard, editUserProfile)
  .delete(authGuard, deleteUser)
  .get(getUserProfile);

router.route("/protected").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    msg: "User authenticated with a session",
    user: req.user,
  });
});

export default router;
