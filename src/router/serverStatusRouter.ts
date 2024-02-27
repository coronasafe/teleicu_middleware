import express from "express";

import { ServerStatusController } from "@/controller/ServerStatusController";
import { jwtAuth } from "@/middleware/auth";

const router = express.Router();

router.use(jwtAuth());

router.get("", ServerStatusController.render);

export { router as serverStatusRouter };
