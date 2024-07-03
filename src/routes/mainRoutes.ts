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
router.route("/api/posts").post(createNewPost).get(getPosts);
router
  .route("/api/post/:id")
  .get(getSinglePost)
  .patch(editPost)
  .delete(deletePost);

router
  .route("/api/user/:id")
  .patch(editUserProfile)
  .delete(deleteUser)
  .get(getUserProfile);

router.route("/protected").get(authGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "User authenticated with a session",
    user: req.user,
  });
});

export default router;
