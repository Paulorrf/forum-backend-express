import { Router } from "express";
import { deleteComment } from "../controllers/deleteComment";

const router = Router();

router.delete("/", deleteComment);

export { router as deleteCommentRoute };
