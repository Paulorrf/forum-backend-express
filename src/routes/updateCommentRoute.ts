import { Router } from "express";
import { updateComment } from "../controllers/updateComment";

const router = Router();

router.put("/", updateComment);

export { router as updateCommentRoute };
