import axios from 'axios'
import { generateHeaders } from "../utils/assetUtils.js";
import { careApi } from '../utils/configs.js';

export const CareCommunicationCheckController = async (req, res, next) => {
  const value = await axios.get(
    `${careApi}/middleware/verify`,
    {
      headers: await generateHeaders(req.body.asset_id)
    }
  ).then(res => {
    return res.data
  }).catch(error => {
    return { "error": "Authorization Failed" }
  })
  return res.send(value)
};
