import { PrismaClient } from "@prisma/client"
import axios from 'axios'
import { generateHeaders } from "./assetUtils.js"
import { careApi } from "./configs.js"



const prisma = new PrismaClient()


export const getAsset = async (assetIp) => {
  return await prisma.asset.findFirst({
    where: {
      ipAddress: {
        equals: assetIp
      },
      deleted: {
        equals: false
      }
    }
  }).catch(
    err => {
      console.log("Asset not found for assetIp: ", assetIp)
      console.log(err)
      return null
    }
  )
}

export const getPatientId = async (assetExternalId) => {
  return await axios.get(`${careApi}/api/v1/consultation/patient_from_asset/`,
    { headers: await generateHeaders(assetExternalId) }
  ).then(res => res.data).catch(err => {
    console.log("No patient connected assetExternalId: ", assetExternalId)
    console.log(err.response.data || err.response.statusText)
    return {}
  })
}
