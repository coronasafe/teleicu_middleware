import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

import type { CameraAsset, CameraParams, CameraPreset } from "@/types/camera";
import type {
  OCRObservationV1Raw,
  OCRObservationV1Sanitized,
} from "@/types/ocr";
import { CameraUtils } from "@/utils/CameraUtils";
import { ocrApi, saveOCRImages, waitBeforeOCRCapture } from "@/utils/configs";
import { downloadImage } from "@/utils/downloadImageWithDigestRouter";

const celsiusToFahrenheit = (celsius: string) => {
  const celsiusNumber = parseFloat(celsius);
  const fahrenheit = (celsiusNumber * 9) / 5 + 32;
  return fahrenheit;
};

const validator = (
  value: number | string | null | undefined,
  parser: (value: any) => number,
  minvalue?: number,
  maxValue?: number,
) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return null;
  }

  value = parser(value);

  if (minvalue !== undefined && value < minvalue) {
    return null;
  }

  if (maxValue !== undefined && value > maxValue) {
    return null;
  }

  return value;
};

const getSanitizedData = (data: OCRObservationV1Raw) => {
  console.log("Data from OCR: ", data);

  const sanitizedData: OCRObservationV1Sanitized = {};
  sanitizedData["spo2"] = validator(data?.["SpO2"], parseInt);

  sanitizedData["ventilator_spo2"] = validator(
    sanitizedData.spo2,
    parseInt,
    0,
    100,
  );

  sanitizedData["resp"] = validator(
    data?.["Respiratory Rate"],
    parseInt,
    10,
    70,
  );

  sanitizedData["pulse"] = validator(data?.["Pulse Rate"], parseInt, 0, 100);

  sanitizedData["temperature"] = validator(
    data?.["Temperature"],
    celsiusToFahrenheit,
    95,
    106,
  );

  const bp = validator(data?.["Blood Pressure"], parseFloat);
  sanitizedData["bp"] = bp ? { systolic: bp, mean: bp, diastolic: bp } : null;

  return sanitizedData;
};

const fileToBase64 = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    return buffer.toString("base64");
  } catch (err) {
    console.log("Error in fileToBase64: ", err);
    return null;
  }
};

const extractData = async (
  camParams: CameraParams,
  monitorPreset = { x: 0, y: 0, zoom: 0 },
): Promise<[OCRObservationV1Sanitized, string | null]> => {
  try {
    console.log("Moving to coordinates: ", monitorPreset);
    await CameraUtils.absoluteMove({ camParams, ...monitorPreset });

    CameraUtils.lockCamera(camParams.hostname);

    // TODO: replace timeout with a better solution
    await new Promise((resolve) =>
      setTimeout(resolve, waitBeforeOCRCapture * 1000),
    );

    const snapshotUrl = await CameraUtils.getSnapshotUri({ camParams });

    CameraUtils.unlockCamera(camParams.hostname);

    const fileName = "image-" + new Date().getTime() + ".jpeg";
    const imagePath = path.resolve("images", fileName);
    await downloadImage(
      snapshotUrl.uri,
      imagePath,
      camParams.username,
      camParams.password,
    );
    // const testImg = path.resolve("images", "test.png")

    // POST request with image to ocr
    const bodyFormData = new FormData();
    bodyFormData.append("image", fs.createReadStream(imagePath));

    if (!ocrApi) {
      throw new Error("OCR_URL is not defined");
    }

    const response = await axios.post(ocrApi, bodyFormData, {
      headers: {
        ...bodyFormData.getHeaders(),
      },
    });

    if (!saveOCRImages) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          // TODO: Critical logger setup
          console.error(err);
        }
      });
    }

    return [getSanitizedData(response.data.data), fileToBase64(imagePath)];
  } catch (err) {
    console.log("Error in extractData: ", err);
    CameraUtils.unlockCamera(camParams.hostname);
    return [
      {
        spo2: null,
        ventilator_spo2: null,
        resp: null,
        pulse: null,
        temperature: null,
        bp: null,
      },
      null,
    ];
  }
};

const _getCamParams = (params: {
  hostname: string;
  username: string;
  password: string;
  port: string | number;
}) => {
  const { hostname, username, password, port } = params;

  const camParams = {
    useSecure: Number(port) === 443,
    hostname,
    username,
    password,
    port: Number(port),
  };

  return camParams;
};

export const updateObservationAuto = async (
  cameraParams: CameraAsset,
  monitorPreset: CameraPreset,
): Promise<[OCRObservationV1Sanitized, string | null]> => {
  try {
    const cameraParamsSanitized = _getCamParams(cameraParams);

    const payload = await extractData(cameraParamsSanitized, monitorPreset);

    return payload;
  } catch (err) {
    console.log(err);
    return [
      {
        spo2: null,
        ventilator_spo2: null,
        resp: null,
        pulse: null,
        temperature: null,
        bp: null,
      },
      null,
    ];
  }
};
