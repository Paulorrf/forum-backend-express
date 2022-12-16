import { Router } from "express";
import { getUserId } from "../controllers/getUserId";

const router = Router();

router.post("/", getUserId);

export { router as getUserIdRoute };
