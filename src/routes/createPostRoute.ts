import { Router } from "express";
import { createPost } from "../controllers/createPostController";

const router = Router();

router.post("/", createPost);

export { router as createPostRouter };
