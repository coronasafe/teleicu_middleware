import axios from "axios";
import dayjs from "dayjs";
import type { Request, Response } from "express";

import { BadRequestException } from "@/Exception/BadRequestException";
import { NotFoundException } from "@/Exception/NotFoundException";
import prisma from "@/lib/prisma";
import type {
  DailyRoundObservation,
  LastObservationData,
  Observation,
  ObservationStatus,
  ObservationType,
  ObservationTypeWithWaveformTypes,
  StaticObservation,
} from "@/types/observation";
import { WebSocket } from "@/types/ws";
import { isValid } from "@/utils/ObservationUtils";
import { ObservationsMap } from "@/utils/ObservationsMap";
import { generateHeaders } from "@/utils/assetUtils";
import { updateObservationAuto } from "@/utils/autoDataExtractor";
import { catchAsync } from "@/utils/catchAsync";
import { careApi, saveDailyRound } from "@/utils/configs";
import { getAsset, getBedById, getPatientId } from "@/utils/dailyRoundUtils";
import { makeDataDumpToJson } from "@/utils/makeDataDump";
import { filterClients } from "@/utils/wsUtils";

const dailyRoundTag = () => new Date().toISOString() + " [Daily Round] ";

var staticObservations: StaticObservation[] = [];
var activeDevices: string[] = [];
var lastRequestData = {};
var logData: {
  dateTime: string;
  data: Observation[][];
}[] = [];
var statusData: ObservationStatus[] = [];
var lastObservationData: LastObservationData = {};
let observationData: { time: Date; data: Observation[][] }[] = [];

// start updating after 1 minutes of starting the middleware
let lastUpdatedToCare = new Date().getTime() - 59 * 60 * 1000;
// For testing purposes, setting
// let lastUpdatedToCare = new Date() - (4 * 60 * 1000 + 50 * 1000);

// Update Interval is set to 1 hour
const UPDATE_INTERVAL = 60 * 60 * 1000;
const S3_DATA_DUMP_INTERVAL = 1000 * 60 * 60;
// For testing purposes, set update interval to 5 minutes
// const UPDATE_INTERVAL = 5 * 60 * 1000;
const DEFAULT_LISTING_LIMIT = 10;

setInterval(() => {
  makeDataDumpToJson(
    observationData,
    `observations/${new Date().getTime()}.json`,
    {
      slug: "s3_observations_dump",
      options: {
        schedule: {
          type: "interval",
          unit: "minutes",
          value: S3_DATA_DUMP_INTERVAL / (1000 * 60),
        },
      },
    },
  );

  observationData = [];
}, S3_DATA_DUMP_INTERVAL);

const getTime = (date: string) =>
  new Date(date.replace(" ", "T").concat("+0530"));

type _Observation = Observation | _Observation[];
const flattenObservations = (observations: _Observation): Observation[] => {
  if (Array.isArray(observations)) {
    return observations.reduce((acc, observation) => {
      return (acc as _Observation[]).concat(flattenObservations(observation));
    }, []) as Observation[];
  } else {
    return [observations];
  }
};

const addObservation = (observation: Observation) => {
  // console.log(
  //   observation["date-time"],
  //   ": ",
  //   observation.device_id,
  //   "|",
  //   observation.observation_id
  // );
  if (activeDevices.includes(observation.device_id)) {
    staticObservations = staticObservations.map((item) => {
      if (item.device_id === observation.device_id) {
        // Slice the observations to the last DEFAULT_LISTING_LIMIT entries
        const slicedObservations =
          item.observations[observation.observation_id]?.slice(
            -DEFAULT_LISTING_LIMIT,
          ) || [];
        return {
          ...item,
          observations: {
            ...item.observations,
            [observation.observation_id]: [...slicedObservations, observation],
          },
          last_updated: new Date(),
        };
      }
      return item;
    });
  } else {
    activeDevices.push(observation.device_id);
    staticObservations = [
      ...staticObservations,
      {
        device_id: observation.device_id,
        observations: {
          [observation.observation_id]: [observation],
        } as Record<ObservationType, Observation[]>,
        last_updated: new Date(),
      },
    ];
  }
};

const addLogData = (newData: Observation[][]) => {
  // Slice the log data to the last DEFAULT_LISTING_LIMIT entries
  logData = logData.slice(logData.length - DEFAULT_LISTING_LIMIT);
  logData = [
    ...logData,
    {
      dateTime: new Date().toISOString(),
      data: newData,
    },
  ];
};

const updateLastObservationData = (
  flattenedObservations: Observation[],
  skipEmpty = true,
) => {
  flattenedObservations.forEach((observation) => {
    const observationId: ObservationTypeWithWaveformTypes =
      observation.observation_id === "waveform"
        ? `waveform_${observation["wave-name"]}`
        : observation.observation_id;

    if (
      skipEmpty &&
      !observation.value &&
      !observation.data &&
      observation.status !== "final"
    ) {
      return;
    }

    lastObservationData[observationId] ??= {};
    lastObservationData[observationId]![observation.device_id] = observation;
  });
};

const updateObservationsToCare = async () => {
  // console.log(dailyRoundTag() + "updateObservationsToCare called")
  const now = new Date();
  if (now.getTime() - lastUpdatedToCare < UPDATE_INTERVAL) {
    // only update once per hour
    // console.log(dailyRoundTag() + "updateObservationsToCare skipped")
    return;
  }
  lastUpdatedToCare = now.getTime();

  const getValueFromData = (data: Observation) => {
    const observationDate = getTime(data?.["date-time"]);
    const stale = now.getTime() - observationDate.getTime() > UPDATE_INTERVAL;

    const validData = isValid(data);
    console.log(data);
    if (!validData) {
      console.log(
        dailyRoundTag() + "Data Not Valid",
        data["observation_id"],
        "|",
        data.status,
        "|",
        data.value,
      );
      return null;
    } else if (stale) {
      console.log(
        dailyRoundTag() + "Data Stale",
        data["observation_id"],
        "|",
        observationDate.toISOString(),
        "|",
        new Date().toISOString(),
      );
      return null;
    } else {
      return data?.value ?? null;
    }
  };

  console.log(dailyRoundTag() + "Performing daily round");
  for (const observation of staticObservations) {
    try {
      if (
        now.getTime() - new Date(observation.last_updated).getTime() >
        UPDATE_INTERVAL
      ) {
        console.log(
          dailyRoundTag() +
            "Skipping stale observations for device: " +
            observation.device_id,
        );
        continue;
      }

      console.log(
        dailyRoundTag() +
          ">> Updating observation for device:" +
          observation.device_id,
      );

      const asset = await getAsset(observation.device_id);
      if (asset === null) {
        console.error(
          dailyRoundTag() +
            "Asset not found for assetIp: " +
            observation.device_id,
        );
        continue;
      }

      const { consultation_id, patient_id, bed_id } = await getPatientId(
        asset.externalId,
      );
      if (!patient_id) {
        console.error(
          dailyRoundTag() +
            "Patient not found for assetExternalId: " +
            asset.externalId,
        );
        continue;
      }

      console.error(
        dailyRoundTag() + "Compiling data for assetIp: " + asset.ipAddress,
      );

      const data = observation.observations;

      const rawValues = {
        taken_at: observation.last_updated,
        spo2: data["SpO2"]?.[0]?.value,
        resp: data["respiratory-rate"]?.[0]?.value,
        pulse: data["heart-rate"]?.[0]?.value ?? data["pulse-rate"]?.[0]?.value,
        temperature: data["body-temperature1"]?.[0]?.value,
        temperature_measured_at: dayjs(
          data["body-temperature1"]?.[0]?.["date-time"],
          "YYYY-MM-DD HH:mm:ss",
        ).toISOString(),
        bp: {
          systolic: data["blood-pressure"]?.[0]?.systolic?.value,
          diastolic: data["blood-pressure"]?.[0]?.diastolic?.value,
        },
      };
      console.log("Building Payload");

      // additional check to see if temperature is within range
      console.log(data);
      let temperature = getValueFromData(data["body-temperature1"]?.[0]);
      let temperature_measured_at = null;
      // const temperature_low_limit = data["body-temperature1"]?.[0]?.["low-limit"];
      // const temperature_high_limit = data["body-temperature1"]?.[0]?.["high-limit"];
      if (
        data["body-temperature1"]?.[0]?.["low-limit"]! < temperature! &&
        temperature! < data["body-temperature1"]?.[0]?.["high-limit"]!
      ) {
        temperature_measured_at = rawValues.temperature_measured_at;
      } else {
        temperature = null;
      }

      // populate blood-pressure object if data is valid
      const bp: {
        systolic?: number | null;
        diastolic?: number | null;
      } = {};
      if (
        data["blood-pressure"]?.[0]?.status === "final" &&
        now.getTime() -
          getTime(data?.["blood-pressure"]?.[0]?.["date-time"]).getTime() <
          UPDATE_INTERVAL // check if data is not stale
      ) {
        bp.systolic = data["blood-pressure"]?.[0]?.systolic?.value ?? null;
        bp.diastolic = data["blood-pressure"]?.[0]?.diastolic?.value ?? null;
      }

      const spo2 = getValueFromData(data["SpO2"]?.[0]);
      const payload: DailyRoundObservation = {
        spo2,
        ventilator_spo2: spo2,
        resp: getValueFromData(data["respiratory-rate"]?.[0]),
        pulse:
          getValueFromData(data["heart-rate"]?.[0]) ??
          getValueFromData(data["pulse-rate"]?.[0]),
        temperature,
        temperature_measured_at,
        bp,
      };

      console.log(dailyRoundTag() + "Data compiled for " + asset.ipAddress);
      console.table(rawValues);
      console.table(payload);

      const payloadHasData = (payload: Record<string, any>): boolean =>
        Object.entries(payload).some(([key, value]) => {
          if (value === null || value === undefined) {
            console.log(key, " | Value ", value);
            return false;
          } else if (typeof value === "object") {
            console.log(key, " | Object | ", value);
            return payloadHasData(value);
          }
          console.log(key, " | Value | ", value);
          return true;
        });

      //check if there is any data to update
      console.log(
        "Attempt to update data for asset: ",
        asset.ipAddress,
        "with payload: ",
        payload,
      );
      if (!payloadHasData(payload)) {
        console.error(
          dailyRoundTag() + "No data to update for assetIp: " + asset.ipAddress,
        );
        continue;
      }

      payload.taken_at = observation.last_updated;
      payload.rounds_type = "AUTOMATED";

      try {
        const { camera, monitorPreset } = (await getBedById(bed_id)) ?? {};

        if (!camera) {
          throw new Error("Camera not found for bedId: " + bed_id);
        }

        if (!monitorPreset) {
          throw new Error("Monitor preset not found for bedId: " + bed_id);
        }

        const cameraParams = {
          hostname: camera.ipAddress,
          username: camera.username!,
          password: camera.password!,
          port: camera.port!,
        };

        console.log("updateObservationsToCare:cameraParams", cameraParams);

        const [v2Payload, b64Image] = await updateObservationAuto(
          cameraParams,
          monitorPreset,
        );
        await makeDataDumpToJson(
          {
            payload,
            v2Payload,
            assetExternalId: asset.externalId,
            patient_id,
            consultation_id,
            b64Image,
          },
          `${asset.externalId}--${new Date().getTime()}.json`,
        );
      } catch (err) {
        console.log("updateObservationsToCare:Data dump failed", err);
      }
      axios
        .post(
          `${careApi}/api/v1/consultation/${consultation_id}/daily_rounds/`,
          payload,
          { headers: await generateHeaders(asset.externalId) },
        )
        .then((res) => {
          if (saveDailyRound) {
            prisma.dailyRound.create({
              data: {
                assetExternalId: asset.externalId,
                status: res.statusText,
                data: JSON.stringify(payload),
                response: JSON.stringify(res.data),
              },
            });
          }
          console.log(res.data);
          console.log(
            dailyRoundTag() +
              "Updated observation for device: " +
              asset.ipAddress,
          );
          return res;
        })
        .catch((err) => {
          if (saveDailyRound) {
            prisma.dailyRound.create({
              data: {
                assetExternalId: asset.externalId,
                status: err.response.statusText,
                data: JSON.stringify(payload),
                response: JSON.stringify(err.response?.data),
              },
            });
          }
          console.log(err.response?.data || err.response?.statusText);
          console.error(
            dailyRoundTag() +
              "Error updating observations to care for assetIp: " +
              asset.ipAddress,
          );
          return err.response;
        });
    } catch (error) {
      console.error(
        dailyRoundTag() +
          "Error performing observations for assetIp: " +
          observation.device_id,
      );
      console.error(error);
    }
  }
  console.log(dailyRoundTag() + "Daily round finished");
};

const filterStatusData = () => {
  const MIN_IN_MS = 60000;
  statusData = statusData.filter(
    (status) =>
      new Date().getTime() - new Date(status.time).getTime() <= 30 * MIN_IN_MS,
  );
};

const parseDataAsStatus = (data: Observation[][]) => {
  return {
    time: new Date(new Date().setSeconds(0, 0)).toISOString(),

    status: data.reduce(
      (acc, device_observations) => {
        device_observations.forEach((observation) => {
          const { device_id, status } = observation;
          acc[device_id] =
            status?.toLowerCase() === "disconnected" ? "down" : "up";
        });

        return acc;
      },
      {} as ObservationStatus["status"],
    ),
  };
};

const addStatusData = (data: Observation[][]) => {
  filterStatusData();

  const newStatus = parseDataAsStatus(data);

  const index = statusData.findIndex(
    (status) => status.time === newStatus.time,
  );

  if (index === -1) {
    statusData.push(newStatus);
    return;
  }

  statusData[index] = {
    time: newStatus.time,
    status: {
      ...statusData[index].status,
      ...newStatus.status,
    },
  };
};

export class ObservationController {
  // static variable to hold the latest observations

  static latestObservation = new ObservationsMap();

  static getObservations(req: Request, res: Response) {
    const limit = req.query?.limit || DEFAULT_LISTING_LIMIT;
    const ip = req.query?.ip;

    if (!ip) {
      return res.json(staticObservations);
    }
    // console.log("Filtering");
    const filtered = staticObservations.filter(
      (observation) => observation.device_id === ip,
    );
    // Sort the observation by last updated time.
    // .sort(
    //   (a, b) => new Date(a.lastObservationAt) - new Date(b.lastObservationAt)
    // )
    // // Limit the results
    // .slice(0, limit);

    return res.json(filtered ?? []);
  }

  static getLogData(req: Request, res: Response) {
    return res.json(logData);
  }

  static getLastRequestData(req: Request, res: Response) {
    return res.json(lastRequestData);
  }

  static updateObservations = (req: Request, res: Response) => {
    // database logic
    lastRequestData = req.body;
    // console.log("updateObservations", req.body);
    addLogData(req.body);
    addStatusData(req.body);
    const observations = req.body;
    observationData.push({ time: new Date(), data: observations });
    // If req.body.observations is an array, then we need to loop through it and create a new observation for each one
    // If req.body.observations is a single object, then we need to create a new observation for it
    // If req.body.observations is undefined, then we need to return an error
    // If req.body.observations is not an array or object, then we need to return an error
    if (!observations)
      throw new BadRequestException("No observations provided");

    if (typeof observations !== "object")
      throw new BadRequestException("Invalid observations provided");

    const flattenedObservations = flattenObservations(observations);

    updateLastObservationData(flattenedObservations);
    this.latestObservation.set(flattenedObservations);

    filterClients(req.wsInstance.getWss(), "/observations").forEach(
      (client: WebSocket) => {
        const filteredObservations = flattenedObservations?.filter(
          (observation: Observation) =>
            observation?.device_id === client?.params?.ip,
        );

        if (lastObservationData["blood-pressure"]?.[client?.params?.ip!]) {
          filteredObservations?.push(
            lastObservationData["blood-pressure"][client?.params?.ip!],
          );
        }

        if (filteredObservations.length) {
          client.send(JSON.stringify(filteredObservations));
        }
      },
    );

    flattenedObservations.forEach((observation: Observation) => {
      addObservation(observation);
    });

    updateObservationsToCare();

    return res.send(req.body);
  };

  static getTime = async (req: Request, res: Response) => {
    res.send({
      time: new Date().toISOString(),
    });
  };

  static getLatestVitals = catchAsync(async (req: Request, res: Response) => {
    const { device_id } = req.query;
    console.log(this.latestObservation);
    const data = this.latestObservation.get(device_id as string);

    if (!data)
      throw new NotFoundException(`No data found with device id ${device_id}`);

    res.send({
      status: "success",
      data,
    });
  });

  static status = catchAsync(async (req: Request, res: Response) => {
    filterStatusData();
    return res.json(statusData);
  });
}
