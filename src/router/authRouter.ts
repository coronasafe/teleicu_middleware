import express from "express";

import { AuthController } from "@/controller/AuthController";

const router = express.Router();

router.get("/login", AuthController.loginForm);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

export { router as authRouter };
