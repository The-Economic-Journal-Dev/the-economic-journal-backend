import express from "express";
import { getUserFromUid } from "../controllers/users";

const router = express.Router();

router.route("/:uid").get(getUserFromUid);

export default router;
