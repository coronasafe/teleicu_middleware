import axios from "axios";
import type { Request, Response } from "express";

import prisma from "@/lib/prisma";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi } from "@/utils/configs";

export class HealthCheckController {
  static pingCheck = async (req: Request, res: Response) => {
    res.status(200).json({ pong: new Date() });
  };

  static healthCheck = async (req: Request, res: Response) => {
    const server = true;
    const database = await prisma.$queryRaw`SELECT 1;`
      .then(() => true)
      .catch(() => false);

    if (!server || !database) {
      res.status(500);
    } else {
      res.status(200);
    }

    return res.json({ server, database });
  };

  static careCommunicationCheck = async (req: Request, res: Response) => {
    const value = await axios
      .get(`${careApi}/middleware/verify`, {
        headers: await generateHeaders(),
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        res.status(500);
        return { error: error?.response?.data };
      });
    return res.send(value);
  };

  static careCommunicationCheckAsAsset = async (
    req: Request,
    res: Response,
  ) => {
    let asset = null;
    if (req.query.ip || req.query.ext_id) {
      asset = await prisma.asset.findFirst({
        where: {
          OR: [
            { ipAddress: req.query.ip as string },
            { externalId: req.query.ext_id as string },
          ],
          AND: {
            deleted: false,
          },
        },
      });
    } else {
      asset = await prisma.asset.findFirst({
        where: {
          AND: {
            deleted: false,
          },
        },
      });
    }
    if (asset === null) {
      return res.status(404).json({ error: "No active asset found" });
    }

    const value = await axios
      .get(`${careApi}/middleware/verify-asset`, {
        headers: await generateHeaders(asset.externalId),
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        res.status(500);
        return { error: error?.response?.data };
      });
    return res.send(value);
  };
}
