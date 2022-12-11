import { Router } from "express";
import { createPost } from "../controllers/createPostController";

const router = Router();

router.post("/create", createPost);

export { router as createPostRouter };
