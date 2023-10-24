import { CameraUtils } from "../utils/CameraUtils.js";
import { downloadImage } from "./helper/downloadImageWithDigestRouter.js";
import axios from "axios";
import path from "path";
import fs from "fs";
import FormData from "form-data";

import * as dotenv from "dotenv";
import { saveOCRImages, waitBeforeOCRCapture } from "../utils/configs.js";

const OCR_URL = process.env.OCR_URL;

const getValidatedData = (data) => {
  keys = ["spo2", "ventilator_spo2", "resp", "pulse", "temperature", "bp"];

  keys.forEach((key) => {
    if (!(key in data)) {
      data[key] = null;
    }
  });

  return data;

}

const extractData = async (camParams, monitorPreset = { x: 0, y: 0, z: 0 }) => {

  try{

    // Get the image from the camera
    console.log("Moving to coordinates: ", monitorPreset);
    await CameraUtils.absoluteMove({ camParams, ...monitorPreset });

    CameraUtils.lockCamera(camParams.hostname);

    await new Promise((resolve) =>
      setTimeout(resolve, waitBeforeOCRCapture * 1000)
    );


    const snapshotUrl = await CameraUtils.getSnapshotUri({ camParams });

    CameraUtils.unlockCamera(camParams.hostname);

    const fileName = "image-" + new Date().getTime() + ".jpeg";
    const imagePath = path.resolve("images", fileName);
    await downloadImage(
      snapshotUrl.uri,
      imagePath,
      camParams.username,
      camParams.password
    );

    // get ocr data from the image
    const ocrDataForm = new FormData();
    ocrDataForm.append("image", fs.createReadStream(imagePath));
    const response = await axios.post(OCR_URL + "get-ocr-data", ocrDataForm, {
      headers: {
        ...ocrDataForm.getHeaders(),
      },
    });

    const ocr_data = response.data.data;

    // send ocr data to gpt and get the final results
    const predictV2 = await axios.post(OCR_URL + "predict-v2", {
      ocr_data,
    });

    return getValidatedData(predictV2.data.data);
  }
  catch(err){
    console.log("Error in extractData: ", err);
    CameraUtils.unlockCamera(camParams.hostname);
    return {
      spo2: null,
      ventilator_spo2: null,
      resp: null,
      pulse: null,
      temperature: null,
      bp: null,
    };
  }
}

const _getCamParams = (params) => {
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

export const updateObservationAutoV2 = async (cameraParams, monitorPreset) => {
  try {
    const cameraParamsSanitized = _getCamParams(cameraParams);

    const payload = await extractData(cameraParamsSanitized, monitorPreset);

    return payload;
  } catch (err) {
    console.log(err);
    return {
      spo2: null,
      ventilator_spo2: null,
      resp: null,
      pulse: null,
      temperature: null,
      bp: null,
    };
  }
};
