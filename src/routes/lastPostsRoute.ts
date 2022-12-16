import { Router } from "express";
import { lastPosts } from "../controllers/lastPosts";

const router = Router();

router.post("/", lastPosts);

export { router as lastPostsRoute };
