import express, { Request, Response } from "express";
import {
  authenticateFirebaseId,
  verifyRole,
} from "../auth/authenticate-firebase-cred";
import {
  createNewArticle,
  getArticles,
  getSingleArticle,
  editArticle,
  deleteArticle,
} from "../controllers/articles";
import { createNewComment, deleteComment } from "../controllers/comments";

const commentRouter = express.Router();
commentRouter.route("/comments").post(createNewComment).delete(deleteComment);

const router = express.Router();

router
  .route("/articles")
  .post(createNewArticle) // verifyRole(["writer", "admin"])
  .get(getArticles);
router
  .route("/articles/:id")
  .get(getSingleArticle)
  .patch(verifyRole(["writer", "admin"]), editArticle)
  .delete(verifyRole(["writer", "admin"]), deleteArticle);
router.use("/articles/:id", commentRouter);

export default router;
