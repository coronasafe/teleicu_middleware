import express from "express";

import { AssetConfigApiController } from "@/controller/AssetConfigApiController";
import { careJwtAuth } from "@/middleware/auth";

const router = express.Router();

router.use(careJwtAuth());

router.post("", AssetConfigApiController.createAsset);
router.put("/:externalId", AssetConfigApiController.updateAsset);
router.delete("/:externalId", AssetConfigApiController.deleteAsset);

export { router as assetConfigApiRouter };
