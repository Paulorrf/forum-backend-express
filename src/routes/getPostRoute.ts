import { Router } from "express";
import { getPost } from "../controllers/getPost";

const router = Router();

router.post("/", getPost);

export { router as getPostRoute };
