import express from "express";

import { ErrorPageController } from "@/controller/ErrorPageController";
import { HomeController } from "@/controller/HomeController";
import { jwtAuthNoVerify } from "@/middleware/auth";

const router = express.Router();

router.use(jwtAuthNoVerify());

router.get("/", HomeController.index);
router.get("/not-found", ErrorPageController.notFound);
router.get("/unauthorized", ErrorPageController.unauthorized);

export { router as defaultRouter };
