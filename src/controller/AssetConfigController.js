import { PrismaClient } from "@prisma/client"
import dayjs from "dayjs"

const prisma = new PrismaClient()



export class AssetConfigController {

  static listAssets = async (req, res) => {
    prisma.asset.findMany({
      where: {
        deleted: {
          equals: false
        }
      },
      orderBy: [
        {
          updatedAt: "desc"
        }
      ]
    }).then(assets => {
      res.render("pages/assetList", { dayjs, assets, errors: req.flash("error") });
    }).catch(err => {
      res.render("pages/assetList", { dayjs, assets: [], errors: [err.message] });
    })
  }

  static createAsset = async (req, res) => {
    const { name, description, ipAddress, externalId } = req.body;
    prisma.asset.create({
      data: {
        name,
        description,
        ipAddress,
        externalId
      }
    }).then(_ => {
      res.redirect("/assets");
    }).catch(err => {
      req.flash("error", err.message);
      res.redirect("/assets");
    });
  }

  static updateAssetForm = async (req, res) => {

    prisma.asset.findUnique({
      where: {
        id: Number(req.params.id)
      }
    }).then(asset => {
      res.render("pages/assetForm", { dayjs, asset, errors: req.flash("error") });
    }).catch(err => {
      req.flash("error", err.message);
      res.redirect("/assets");
    })
  }

  static updateAsset = async (req, res) => {
    const { name, description, externalId, ipAddress } = req.body;
    prisma.asset.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        name,
        description,
        externalId,
        ipAddress,
        updatedAt: new Date()
      }
    }).then(_ => {
      res.redirect("/assets");
    }).catch(err => {
      req.flash("error", err.message);
      res.redirect(`/assets/${req.params.id}`);
    })
  }

  static confirmDeleteAsset = async (req, res) => {
    const asset = await prisma.asset.findUnique({
      where: {
        id: Number(req.params.id)
      }
    });
    res.render("pages/assetDelete", { dayjs, asset });
  }

  static deleteAsset = async (req, res) => {
    prisma.asset.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        deleted: true,
      }
    }).then(_ => {
      res.redirect("/assets");
    }).catch(err => {
      req.flash("error", err.message);
      res.redirect("/assets");
    })
  }

}
