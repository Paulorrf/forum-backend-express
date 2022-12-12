import { Router } from "express";
import { verifyTokenController } from "../controllers/verifyTokenController";

const router = Router();

router.post("/verify-token", verifyTokenController);

export { router as verifyTokenRoute };
