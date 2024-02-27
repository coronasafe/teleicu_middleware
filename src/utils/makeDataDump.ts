import { captureCheckIn } from "@sentry/node";
import AWS from "aws-sdk";

import {
  s3AccessKeyId,
  s3BucketName,
  s3Endpoint,
  s3Provider,
  s3SecretAccessKey,
} from "@/utils/configs";

export const makeDataDumpToJson = async (
  data: Record<string, any> | any[],
  key: string,
  monitorOptions?: {
    slug: string;
    options?: any;
  },
) => {
  let checkInId: string | undefined = undefined;

  if (monitorOptions) {
    checkInId = captureCheckIn(
      {
        monitorSlug: monitorOptions.slug,
        status: "in_progress",
      },
      monitorOptions.options,
    );
  }

  try {
    const s3 = new AWS.S3({
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
      endpoint: s3Endpoint,
      s3ForcePathStyle: s3Provider !== "AWS",
    });

    if (!s3BucketName) {
      throw new Error("S3 Bucket Name not found");
    }

    const params = {
      Bucket: s3BucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    };

    await new Promise((resolve, reject) => {
      s3.upload(
        params,
        function (err: Error, data: AWS.S3.ManagedUpload.SendData) {
          if (err) {
            console.log("Failed to upload data to S3");
            reject(err);
          } else {
            console.log("Successfully uploaded data to S3");
            resolve(data);
          }
        },
      );
    });

    if (monitorOptions && checkInId) {
      captureCheckIn({
        checkInId,
        monitorSlug: monitorOptions.slug,
        status: "ok",
      });
    }
  } catch (err) {
    if (monitorOptions && checkInId) {
      captureCheckIn({
        checkInId,
        monitorSlug: monitorOptions.slug,
        status: "error",
      });
    }
    console.log(err);
  }
};
