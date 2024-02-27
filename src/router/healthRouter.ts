import express from "express";

import { HealthCheckController } from "@/controller/HealthCheckController";

const router = express.Router();

router.get("/ping", HealthCheckController.pingCheck);
router.get("/status", HealthCheckController.healthCheck);
router.get("/care/communication", HealthCheckController.careCommunicationCheck);
router.get(
  "/care/communication-asset",
  HealthCheckController.careCommunicationCheckAsAsset,
);

export { router as healthRouter };
