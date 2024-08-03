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
  likeArticle,
  unlikeArticle,
} from "../controllers/articles";

const likesRouter = express.Router();
likesRouter
  .route("/like")
  .all(authenticateFirebaseId)
  .post(likeArticle)
  .delete(unlikeArticle);

const router = express.Router();

router
  .route("/articles")
  .post(verifyRole(["writer", "admin"]), createNewArticle)
  .get(getArticles);
router
  .route("/articles/:id")
  .get(getSingleArticle)
  .patch(verifyRole(["writer", "admin"]), editArticle)
  .delete(verifyRole(["writer", "admin"]), deleteArticle);
router.use("/articles/:id", likesRouter);

export default router;
