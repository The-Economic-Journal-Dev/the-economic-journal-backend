import express from "express";
import { uploadImage, deleteImage } from "../controllers/upload";
import { verifyRole } from "../auth/authenticate-firebase-cred";

const router = express.Router();

router.route("/").post(verifyRole(["writer", "admin"]), uploadImage);
router.route("/").delete(verifyRole(["writer", "admin"]), deleteImage);

export default router;
