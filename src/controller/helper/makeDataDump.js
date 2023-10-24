import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import {
  s3AccessKeyId,
  s3BucketName,
  s3Endpoint,
  s3Provider,
  s3SecretAccessKey,
} from "../../utils/configs.js";

dotenv.config({ path: "./.env" });

export const makeDataDumpToJson = async (
  v1Payload,
  v2Payload,
  v3Payload,
  assetExternalId,
  patient_id,
  consultation_id
) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
      endpoint: s3Endpoint,
      s3ForcePathStyle: s3Provider !== "AWS",
    });

    const dataDump = {
      assetExternalId: assetExternalId,
      patient_id: patient_id,
      consultation_id: consultation_id,
      v1Payload: v1Payload,
      v2Payload: v2Payload,
      v3Payload: v3Payload,
    };

    const params = {
      Bucket: s3BucketName,
      Key: `${assetExternalId}--${new Date().getTime()}.json`,
      Body: JSON.stringify(dataDump),
    };

    await new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log("Auto OCR Upload error");
          reject(err);
        } else {
          console.log("Auto OCR Upload Success");
          resolve(data);
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};
