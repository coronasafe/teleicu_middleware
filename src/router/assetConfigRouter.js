import express from "express";
import { AssetConfigController } from "../controller/AssetConfigController.js";

const router = express.Router();

router.get("/assets", AssetConfigController.listAssets);
router.post("/assets", AssetConfigController.createAsset);
router.get("/assets/:id", AssetConfigController.updateAssetForm);
router.post("/assets/:id", AssetConfigController.updateAsset);
router.get("/assets/:id/delete", AssetConfigController.confirmDeleteAsset);
router.post("/assets/:id/delete", AssetConfigController.deleteAsset);

export { router as assetConfigRouter };
