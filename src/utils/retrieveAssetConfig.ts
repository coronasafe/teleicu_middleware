import type { Asset } from "@prisma/client";

import prisma from "@/lib/prisma";
import { AssetConfig } from "@/types/asset";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi, hostname } from "@/utils/configs";

async function insertAsset(asset: AssetConfig) {
  return prisma.asset.upsert({
    where: {
      externalId: asset.id,
    },
    update: {
      description: asset.description,
      ipAddress: asset.ip_address,
      port: asset.port,
      updatedAt: new Date(),
      username: asset.username,
      password: asset.password,
    },
    create: {
      name: asset.name,
      externalId: asset.id,
      description: asset.description ?? "",
      ipAddress: asset.ip_address,
      port: asset.port,
      updatedAt: new Date(),
      username: asset.username,
      password: asset.password,
    },
  });
}

async function deleteAsset(asset: Asset) {
  return prisma.asset.update({
    where: {
      externalId: asset.externalId,
    },
    data: {
      deleted: true,
      ipAddress: asset.ipAddress + "_deleted",
    },
  });
}

export async function retrieveAssetConfig() {
  console.log("Retrieving asset config");

  const data = await fetch(
    `${careApi}/api/v1/asset_config/?middleware_hostname=${hostname}`,
    { headers: await generateHeaders() },
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch asset config: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      const assets = data as AssetConfig[];
      console.log(`Found ${assets?.length ?? 0} assets`);
      return assets;
    })
    .catch((error) => {
      console.error("Failed to fetch asset config", error);
      return null;
    });

  if (!data || data.length === 0) {
    return null;
  }

  const missingAssets = await prisma.asset.findMany({
    where: {
      externalId: {
        notIn: data.map((assetConfig) => String(assetConfig.id)),
      },
      deleted: false,
    },
  });

  //mark assets not in the new list as deleted
  const deleted = await Promise.all(
    missingAssets.map((asset) => deleteAsset(asset)),
  );
  console.log(`Deleted ${deleted.length} assets`);

  //upsert new assets
  const added = await Promise.all(
    data.map((assetConfig) => insertAsset(assetConfig)),
  );
  console.log(`Added ${added.length} assets`);

  return added;
}
