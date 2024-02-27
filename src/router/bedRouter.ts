import express from "express";

import { BedController } from "@/controller/BedController";
import { jwtAuth } from "@/middleware/auth";
import { csrfProtection } from "@/middleware/csrf";

const router = express.Router();

router.use(jwtAuth());
router.use(csrfProtection());

router.get("/", BedController.list);
router.post("/", BedController.create);
router.get("/:id", BedController.editForm);
router.post("/:id", BedController.edit);
router.get("/:id/delete", BedController.confirmDelete);
router.post("/:id/delete", BedController.delete);

export { router as bedRouter };
