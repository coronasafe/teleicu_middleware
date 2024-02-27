import { generateJWT } from "@/lib/jose";
import { facilityID } from "@/utils/configs";

export const generateHeaders = async (asset_id?: string) => {
  return {
    Accept: "application/json",
    Authorization: "Middleware_Bearer " + (await generateJWT({ asset_id })),
    "X-Facility-Id": facilityID,
  };
};
