import { Request, Response } from "express";

import prisma from "@/lib/prisma";
import { AssetConfig } from "@/types/asset";

/**
 * Controller class for managing asset configurations via rest api.
 */
export class AssetConfigApiController {
  /**
   * Creates an asset configuration.
   *
   * @param req - The request object.
   * @param res - The response object.
   * @returns A JSON response indicating the success or failure of the asset creation.
   */
  static createAsset = async (req: Request, res: Response) => {
    try {
      const {
        name,
        type,
        description,
        ip_address,
        id,
        username,
        password,
        port,
      } = req.body as AssetConfig;
      const asset = await prisma.asset.findFirst({
        where: { ipAddress: ip_address },
      });

      if (asset) {
        return res.status(400).json({ message: "IP Address already in use" });
      }
      await prisma.asset.create({
        data: {
          externalId: id,
          name,
          type,
          description: description ?? "",
          ipAddress: ip_address,
          username,
          password,
          port: Number(port),
        },
      });
      return res.status(201).json({ message: "Asset created" });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  };

  static updateAsset = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.externalId);
      const { name, type, description, ip_address, username, password, port } =
        req.body as AssetConfig;

      console.log(req.body);

      const asset = await prisma.asset.findFirst({
        where: {
          ipAddress: {
            equals: ip_address,
          },
          externalId: {
            not: String(id),
          },
        },
      });
      if (asset) {
        return res.status(400).json({ message: "IP Address already in use" });
      }

      await prisma.asset.upsert({
        where: {
          externalId: String(id),
        },
        update: {
          name,
          description,
          externalId: id,
          ipAddress: ip_address,
          updatedAt: new Date(),
          type,
          username,
          password,
          port: Number(port),
        },
        create: {
          name,
          description: description ?? "",
          externalId: id,
          ipAddress: ip_address,
          updatedAt: new Date(),
          type,
          username,
          password,
          port: Number(port),
        },
      });
      return res.status(200).json({ message: "Asset updated" });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  };

  static deleteAsset = async (req: Request, res: Response) => {
    try {
      const asset = await prisma.asset.findUnique({
        where: {
          externalId: String(req.params.externalId),
        },
      });

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      await prisma.asset.update({
        where: {
          externalId: asset.externalId,
        },
        data: {
          deleted: true,
          ipAddress: asset.ipAddress + "_deleted",
        },
      });
      return res.status(200).json({ message: "Asset deleted" });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  };
}
