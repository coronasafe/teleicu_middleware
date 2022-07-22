
import { generateJWT } from "./generateJWT.js"
import { facilityID } from "./configs.js"

export const generateHeaders = async (asset_id) => {
  return {
    Accept: "application/json",
    Authorization: "Middleware_Bearer " + await generateJWT({ asset_id }),
    "X-Facility-Id": facilityID
  }
}