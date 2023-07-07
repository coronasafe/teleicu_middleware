import express from "express";
import { ObservationController } from "../controller/ObservationController.js";
import { validate } from "../middleware/validate.js";
import { observationsValidators, vitalsValidator, autoObservationValidator } from "../Validators/observationValidators.js";


const router = express.Router();

router.get("/get_observations", ObservationController.getObservations);

router.post(
  "/update_observations",
  validate(observationsValidators),
  ObservationController.updateObservations
);

router.get(
  "/vitals",
  validate(vitalsValidator),
  ObservationController.getLatestVitals
);

router.get("/get_time", ObservationController.getTime);

// Debugging Endpoints

router.get("/get_log_data", ObservationController.getLogData);

router.get("/get_last_request_data", ObservationController.getLastRequestData);

router.get("/get_last_request_time", ObservationController.getLastRequestTime);

export { router as observationRouter };
