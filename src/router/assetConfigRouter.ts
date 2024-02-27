import express from "express";

import { AssetConfigController } from "@/controller/AssetConfigController";
import { jwtAuth } from "@/middleware/auth";
import { csrfProtection } from "@/middleware/csrf";

const router = express.Router();

router.use(jwtAuth());
router.use(csrfProtection());

router.get("/", AssetConfigController.listAssets);
router.get("/new", AssetConfigController.createAssetForm);
router.post("/", AssetConfigController.createAsset);
router.get("/:externalId", AssetConfigController.updateAssetForm);
router.post("/:externalId", AssetConfigController.updateAsset);
router.get("/:externalId/delete", AssetConfigController.confirmDeleteAsset);
router.post("/:externalId/delete", AssetConfigController.deleteAsset);

export { router as assetConfigRouter };
