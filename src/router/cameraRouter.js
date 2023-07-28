import express from "express";


import { CameraController } from "../controller/CameraController.js";
import { validate } from "../middleware/validate.js";
import {
  baseCameraParamsValidators,
  camerasStatusBodyValidators,
  setPresetValidators,
  baseGetCameraParamsValidators,
  camMoveValidator,
  gotoPresetValidator,
} from "../Validators/cameraValidators.js";

const router = express.Router();

router.get(
  "/presets",
  validate(baseGetCameraParamsValidators),
  CameraController.getPresets
);

router.post(
  "/presets",
  validate(setPresetValidators),
  CameraController.setPreset
);

router.get(
  "/status",
  validate(baseGetCameraParamsValidators),
  CameraController.getStatus
);

router.post(
  "/cameras/status",
  validate(camerasStatusBodyValidators),
  CameraController.getCameraStatuses
);

router.post(
  "/gotoPreset",
  validate(gotoPresetValidator),
  CameraController.gotoPreset
);

router.post(
  "/absoluteMove",
  validate(camMoveValidator),
  CameraController.absoluteMove
);

router.post(
  "/relativeMove",
  validate(camMoveValidator),
  CameraController.relativeMove
);

// BPL Integration

router.get("/get_time", CameraController.getTime);

export { router as cameraRouter };
