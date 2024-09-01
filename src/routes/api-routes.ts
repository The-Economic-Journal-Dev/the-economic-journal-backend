import express from "express";
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
import upload from "../config/multer-config"

const router = express.Router();
const likeRouter = express.Router({ mergeParams: true });

router.use("/:id/like", likeRouter);

likeRouter
  .route("/")
  .post(authenticateFirebaseId, likeArticle)
  .delete(authenticateFirebaseId, unlikeArticle);

router.route("/search").get(searchArticles);

router
  .route("/")
  .post(upload.none(), verifyRole(["writer", "admin"]), createNewArticle)
  .get(getArticles);

router
  .route("/:id")
  .get(getSingleArticle)
  .patch(upload.none(), verifyRole(["writer", "admin"]), editArticle)
  .delete(verifyRole(["writer", "admin"]), deleteArticle);

export default router;
