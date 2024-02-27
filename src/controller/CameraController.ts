import type { Request, Response } from "express";

import type { CameraAsset, CameraStatus } from "@/types/camera";
import { CameraUtils } from "@/utils/CameraUtils";
import { catchAsync } from "@/utils/catchAsync";

var assets: CameraAsset[] = [];
var statuses: CameraStatus[] = [];
var fetchStatusesInterval: NodeJS.Timeout | undefined;

const filterStatus = () => {
  const MIN_IN_MS = 60000;
  statuses = statuses.filter(
    (status) =>
      new Date().getTime() - new Date(status.time).getTime() <= 30 * MIN_IN_MS,
  );
};

const fetchCameraStatuses = async () => {
  filterStatus();

  const cameraStatuses: {
    deviceId: string;
    status: "up" | "down";
  }[] = await Promise.all(
    assets.map(async (camera) => {
      try {
        const camParams = CameraController._getCamParams(camera);
        const status = await CameraUtils.getStatus({ camParams });

        return {
          deviceId: camera.hostname,
          status: status?.error === "NO error" ? "up" : "down",
        };
      } catch (error) {
        console.error(error);

        return {
          deviceId: camera.hostname,
          status: "down",
        };
      }
    }),
  );

  statuses.push({
    time: new Date().toISOString(),
    status: cameraStatuses.reduce(
      (acc, curr) => {
        acc[curr.deviceId] = curr.status;
        return acc;
      },
      {} as CameraStatus["status"],
    ),
  });
};

export class CameraController {
  static _getCamParams = (body: CameraAsset) => {
    const { hostname, username, password, port } = body;

    const camParams = {
      useSecure: Number(port) === 443,
      hostname,
      username,
      password,
      port: Number(port),
    };

    return camParams;
  };

  /**
   * @swagger
   * /gotopreset:
   *   post:
   *     summary: "Move camera to preset"
   *     description: ""
   *     tags:
   *       - preset
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: integer
   *                 required: true
   *               preset:
   *                 type: integer
   *                 required: true
   *     responses:
   *       "200":
   *         description: Return success message
   */
  static gotoPreset = catchAsync(async (req: Request, res: Response) => {
    const camParams = this._getCamParams(req.body);
    const { preset } = req.body;

    await CameraUtils.gotoPreset({ camParams, preset });

    res.send({
      status: "success",
      message: `Camera preset is set to ${preset}.`,
    });
  });
  /**
   * @swagger
   * /presets:
   *   get:
   *     summary: "List all presets"
   *     description: ""
   *     tags:
   *       - preset
   *     parameters:
   *       - name: hostname
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: username
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: password
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: port
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       "200":
   *         description: Return all available presets
   */
  static getPresets = catchAsync(async (req: Request, res: Response) => {
    const camParams = this._getCamParams(req.query as unknown as CameraAsset);
    const presets = await CameraUtils.getPreset({ camParams });
    res.send(presets);
  });

  /**
   * @swagger
   * /status:
   *   get:
   *     summary: "Get camera status "
   *     description: ""
   *     tags:
   *       - status
   *     parameters:
   *       - name: hostname
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: username
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: password
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: port
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       "200":
   *         description: Return camera status
   */

  static getStatus = catchAsync(async (req: Request, res: Response) => {
    const camParams = this._getCamParams(req.query as unknown as CameraAsset);
    const status = await CameraUtils.getStatus({ camParams });

    res.send(status);
  });

  /**
   * @swagger
   * /cameras/status:
   *   post:
   *     summary: "Get status of cameras"
   *     tags:
   *       - status
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 hostname:
   *                   type: string
   *                   description: Device Id or device IP address
   *                 port:
   *                   type: number
   *                   enum: [80, 443]
   *                 username:
   *                   type: string
   *                 password:
   *                   type: string
   *     responses:
   *       "200":
   *         description: Return camera statuses
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 time:
   *                   type: string
   *                   format: date-time
   *                 status:
   *                   type: object
   *                   properties:
   *                     device_id:
   *                       type: string
   *                       enum: [up, down]
   */
  static getCameraStatuses = catchAsync(async (req: Request, res: Response) => {
    assets = req.body;
    await fetchCameraStatuses();

    clearInterval(fetchStatusesInterval);
    fetchStatusesInterval = setInterval(fetchCameraStatuses, 60 * 1000);

    return res.json(statuses);
  });

  /**
   * @swagger
   * /absoluteMove:
   *   post:
   *     summary: "Move camera to absolute position"
   *     description: ""
   *     tags:
   *       - move
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: number
   *                 required: true
   *               x:
   *                 type: number
   *                 required: true
   *               y:
   *                 type: number
   *                 required: true
   *               zoom:
   *                 type: number
   *                 required: true
   *
   *     responses:
   *       "200":
   *         description: Return all available presets
   */

  static absoluteMove = catchAsync(async (req: Request, res: Response) => {
    const camParams = this._getCamParams(req.body);
    const { x, y, zoom } = req.body;

    await CameraUtils.absoluteMove({ camParams, x, y, zoom });

    res.send({
      status: "success",
      message: `Camera position updated!`,
    });
  });

  /**
   * @swagger
   * /relativeMove:
   *   post:
   *     summary: "Move camera to relative position"
   *     description: ""
   *     tags:
   *       - move
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: number
   *                 required: true
   *               x:
   *                 type: number
   *                 required: true
   *               y:
   *                 type: number
   *                 required: true
   *               zoom:
   *                 type: number
   *                 required: true
   *
   *     responses:
   *       "200":
   *         description: Return all available presets
   */

  static relativeMove = catchAsync(async (req: Request, res: Response) => {
    const camParams = this._getCamParams(req.body);
    const { x, y, zoom } = req.body;

    await CameraUtils.relativeMove({ camParams, x, y, zoom });

    res.send({
      status: "success",
      message: `Camera position updated!`,
    });
  });

  /**
   * @swagger
   * /get_time:
   *   get:
   *     summary: "Get current time"
   *     description: ""
   *     tags:
   *       - BPL
   *     responses:
   *       "200":
   *         description: Return current time
   */
  static getTime = catchAsync(async (req: Request, res: Response) => {
    res.send({
      time: new Date().toISOString(),
    });
  });

  /**
   * @swagger
   * /preset:
   *   post:
   *     summary: "Create new camera preset"
   *     description: ""
   *     tags:
   *       - preset
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: number
   *                 required: true
   *               presetName:
   *                 type: string
   *                 required: true
   *
   *     responses:
   *       "200":
   *         description: Return 200 if new camera preset is created
   */
  static setPreset = catchAsync(async (req: Request, res: Response) => {
    const camParams = this._getCamParams(req.query as unknown as CameraAsset);
    const { presetName } = req.body;

    await CameraUtils.setPreset({ camParams, presetName });

    res.send({
      status: "success",
      message: "Camera preset added.",
    });
  });
}
