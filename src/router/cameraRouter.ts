import express from "express";

import {
  baseGetCameraParamsValidators,
  camMoveValidator,
  gotoPresetValidator,
  setPresetValidators,
} from "@/Validators/cameraValidators";
import { CameraController } from "@/controller/CameraController";
import { validate } from "@/middleware/validate";

const router = express.Router();

router.get(
  "/presets",
  validate(baseGetCameraParamsValidators),
  CameraController.getPresets,
);

router.post(
  "/presets",
  validate(setPresetValidators),
  CameraController.setPreset,
);

router.get(
  "/status",
  validate(baseGetCameraParamsValidators),
  CameraController.getStatus,
);

router.post("/cameras/status", CameraController.getCameraStatuses);

router.post(
  "/gotoPreset",
  validate(gotoPresetValidator),
  CameraController.gotoPreset,
);

router.post(
  "/absoluteMove",
  validate(camMoveValidator),
  CameraController.absoluteMove,
);

router.post(
  "/relativeMove",
  validate(camMoveValidator),
  CameraController.relativeMove,
);

// BPL Integration

router.get("/get_time", CameraController.getTime);

export { router as cameraRouter };
