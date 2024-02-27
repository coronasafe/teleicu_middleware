import dayjs from "dayjs";
import { Request, Response } from "express";

import prisma from "@/lib/prisma";

export class AssetConfigController {
  static listAssets = async (req: Request, res: Response) => {
    try {
      const assets = await prisma.asset.findMany({
        where: {
          deleted: false,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      const beds = await prisma.bed.findMany({
        where: {
          deleted: false,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/assets/list", {
        req,
        dayjs,
        assets,
        beds,
        errors: req.flash("error"),
      });
    } catch (err: any) {
      res.render("pages/assets/list", {
        req,
        dayjs,
        assets: [],
        beds: [],
        errors: [err.message],
      });
    }
  };

  static createAssetForm = async (req: Request, res: Response) => {
    res.render("pages/assets/form", {
      req,
      dayjs,
      csrfToken: res.locals.csrfToken,
      asset: {},
      errors: req.flash("error"),
    });
  };

  static createAsset = async (req: Request, res: Response) => {
    try {
      const {
        name,
        type,
        description,
        ipAddress,
        accessKey,
        externalId,
        username,
        password,
        port,
      } = req.body;

      let asset = await prisma.asset.findFirst({ where: { ipAddress } });
      if (asset) {
        req.flash("error", "IP Address already in use");
        res.redirect("/assets/new");
        return;
      }

      const values = {
        name,
        type,
        description,
        ipAddress,
        accessKey,
        externalId,
        username,
        password,
        port: Number(port),
      };

      // restore asset if it was deleted else create new asset
      await prisma.asset.upsert({
        where: {
          externalId,
        },
        update: {
          ...values,
        },
        create: {
          ...values,
          externalId,
        },
      });

      res.redirect("/assets");
    } catch (error: any) {
      req.flash("error", error?.message ?? "An error occurred");
      res.redirect("/assets");
    }
  };

  static updateAssetForm = async (req: Request, res: Response) => {
    try {
      const asset = await prisma.asset.findUniqueOrThrow({
        where: {
          externalId: String(req.params.externalId),
        },
      });

      const beds = await prisma.bed.findMany({
        where: {
          deleted: false,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/assets/form", {
        req,
        dayjs,
        csrfToken: res.locals.csrfToken,
        asset,
        beds,
        errors: req.flash("error"),
      });
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/assets");
    }
  };

  static updateAsset = async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        externalId,
        ipAddress,
        type,
        accessKey,
        username,
        password,
        port,
      } = req.body;

      const asset = await prisma.asset.findFirst({
        where: {
          ipAddress: {
            equals: ipAddress,
          },
          externalId: {
            not: String(req.params.externalId),
          },
        },
      });
      if (asset) {
        req.flash("error", "IP Address already in use");
        res.redirect("/assets");
        return;
      }

      await prisma.asset.update({
        where: {
          externalId: String(req.params.externalId),
        },
        data: {
          name,
          description,
          externalId,
          ipAddress,
          accessKey,
          type,
          updatedAt: new Date(),
          username,
          password,
          port: Number(port),
        },
      });
      res.redirect("/assets");
    } catch (error: any) {
      req.flash("error", error?.message ?? "An error occurred");
      res.redirect("/assets");
    }
  };

  static confirmDeleteAsset = async (req: Request, res: Response) => {
    try {
      const asset = await prisma.asset.findUnique({
        where: {
          externalId: String(req.params.externalId),
        },
      });
      if (!asset) {
        req.flash("error", "Asset not found");
        res.redirect("/assets");
        return;
      }
      res.render("pages/assets/delete", {
        req,
        csrfToken: res.locals.csrfToken,
        dayjs,
        asset,
      });
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/assets");
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
        req.flash("error", "Asset not found");
        res.redirect("/assets");
        return;
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
      res.redirect("/assets");
    } catch (error: any) {
      req.flash("error", error.message);
      res.redirect("/assets");
    }
  };
}
