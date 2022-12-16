import { Router } from "express";
import { createComment } from "../controllers/createComment";

const router = Router();

router.post("/", createComment);

export { router as createCommentRoute };
