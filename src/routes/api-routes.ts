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

// Use this router
router
  .route("/:id/like")
  .all(authenticateFirebaseId)
  .post(likeArticle)
  .delete(unlikeArticle);

router
  .route("/:id")
  .get(getSingleArticle)
  .patch(verifyRole(["writer", "admin"]), editArticle)
  .delete(verifyRole(["writer", "admin"]), deleteArticle);
// In this router

router.route("/search").get(searchArticles);

export default router;
