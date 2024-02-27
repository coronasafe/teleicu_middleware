import express from "express";

import { StreamAuthApiController } from "@/controller/StreamAuthApiController";
import { careJwtAuth } from "@/middleware/auth";

const router = express.Router();

router.post("/verifyToken", StreamAuthApiController.validateStreamToken);
router.post(
  "/getToken/videoFeed",
  careJwtAuth(),
  StreamAuthApiController.getVideoFeedStreamToken,
);
router.post(
  "/getToken/vitals",
  careJwtAuth(),
  StreamAuthApiController.getVitalStreamToken,
);

export { router as streamAuthApiRouter };
