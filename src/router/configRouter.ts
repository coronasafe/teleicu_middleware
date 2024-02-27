import express from "express";

import { ConfigController } from "@/controller/ConfigController";
import { jwtAuth } from "@/middleware/auth";

const router = express.Router();

router.use(jwtAuth());

router.get("", ConfigController.renderUpdateConfig);
router.post("", ConfigController.updateConfig);

export { router as configRouter };
