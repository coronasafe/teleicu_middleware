import express from "express";
import { AuthController } from "../controller/AuthController.js";

const router = express.Router();

router.post("/verify", AuthController.verifyToken);
router.post("/generate", AuthController.generateToken);

export { router as authRouter };
