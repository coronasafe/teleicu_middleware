import { body, query } from "express-validator";

import { baseCameraParamsValidators } from "@/Validators/cameraValidators";

const Observations = {
  ST: "ST",
  HEART_RATE: "heart-rate",
  PULSE_RATE: "pulse-rate",
  RESPIRATORY_RATE: "respiratory-rate",
  SPO2: "SpO2",
  BODY_TEMP_1: "body-temperature1",
  BODY_TEMP_2: "body-temperature2",
  BLOOD_PRESSURE: "blood-pressure",
  IBP1: "IBP1",
  IBP2: "IBP2",
};

const baseObservationValidators = [
  body("*.observation_id")
    .exists({ checkFalsy: true })
    .withMessage("observation_id is required.")
    .isString()
    .withMessage("observation_id must be string.")
    .isIn(Object.values(Observations))
    .withMessage(
      "observation_id must be one of: " + Object.values(Observations),
    ),
  body("*.device_id")
    .exists({ checkFalsy: true })
    .withMessage("device_id is required.")
    .isString()
    .withMessage("device_id must be string.")
    .isIP(4)
    .withMessage("device_id must be valid ip"),
  body("*.date-time")
    .exists({ checkFalsy: true })
    .withMessage("date-time is required.")
    .isString()
    .withMessage("date-time must be string.")
    .custom((val) => !isNaN(new Date(val).getTime()))
    .withMessage("date-time must be valid date string."),
  // body("*.patient-id")
  //   .exists({ checkFalsy: true })
  //   .withMessage("patient-id is required.")
  //   .isString()
  //   .withMessage("patient-id must be string."),
  // body("*.patient-name")
  //   .exists({ checkFalsy: true })
  //   .withMessage("patient-name is required.")
  //   .isString()
  //   .withMessage("patient-name must be string."),
  body("*.status")
    .exists({ checkFalsy: true })
    .withMessage("status is required.")
    .isString()
    .withMessage("status must be string."),
];

const getObservationsValidators = (path = "") => [
  body(`${path}value"`)
    .optional()
    .isNumeric()
    .withMessage("value must be number."),
  body(`${path}unit`)
    .optional()
    .exists({ checkFalsy: true })
    .withMessage("unit is required.")
    .isString()
    .withMessage("unit must be string."),
  body(`${path}low-limit`)
    .optional()
    .exists({ checkFalsy: true })
    .withMessage("low-limit is required.")
    .isNumeric()
    .withMessage("low-limit must be number."),
  body(`${path}high-limit`)
    .optional()
    .exists({ checkFalsy: true })
    .withMessage("high-limit is required.")
    .isNumeric()
    .withMessage("high-limit must be number."),
  body(`interpretation`)
    .optional()
    .isString()
    .withMessage("interpretation must be string"),
];

export const bloodPressureValidators = [
  ...baseObservationValidators,
  ...getObservationsValidators("*.systolic."),
  ...getObservationsValidators("*.diastolic."),
  ...getObservationsValidators("*.map."),
];

export const observationsValidators = [
  // ...bloodPressureValidators,
  // ...getObservationsValidators(),
];

export const vitalsValidator = [
  query("device_id")
    .exists({ checkFalsy: true })
    .withMessage("device_id is required.")
    .isString()
    .withMessage("device_id must be string."),
];

export const autoObservationValidator = [
  ...baseCameraParamsValidators,
  body("assetExternalId")
    .exists({ checkFalsy: true })
    .withMessage("assetExternalId is required.")
    .isString()
    .withMessage("assetExternalId must be string."),
];
