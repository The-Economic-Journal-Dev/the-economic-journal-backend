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
  searchArticles,
} from "../controllers/articles";

const router = express.Router();

router
  .route("/")
  .post(verifyRole(["writer", "admin"]), createNewArticle)
  .get(getArticles);
router
  .route("/:id")
  .get(getSingleArticle)
  .patch(verifyRole(["writer", "admin"]), editArticle)
  .delete(verifyRole(["writer", "admin"]), deleteArticle);

router.route("/search").get(searchArticles);

router
  .route("/:id/like")
  .all(authenticateFirebaseId)
  .post(likeArticle)
  .delete(unlikeArticle);

export default router;
