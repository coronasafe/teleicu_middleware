import express from "express";
import { verify } from "../middleware/verifyToken.js";

import { CameraController } from "../controller/CameraController.js";
import { validate } from "../middleware/validate.js";
import {
    baseCameraParamsValidators,
    setPresetValidators,
    baseGetCameraParamsValidators,
    camMoveValidator,
    gotoPresetValidator,
} from "../Validators/cameraValidators.js";

const router = express.Router();

router.get(
    "/presets", [verify],
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