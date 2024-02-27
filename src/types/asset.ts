import type { AssetType } from "@prisma/client";

export interface AssetConfig {
  id: string;
  name: string;
  type: AssetType;
  description?: string;
  ip_address: string;
  access_key?: string;
  username?: string;
  password?: string;
  port?: number;
}
