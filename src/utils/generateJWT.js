import fs from "fs";
import jose from "node-jose";

export const generateJWT = async (claims) => {
  /*
    Creates a JWT token with the given claims with an expiry of 1 min,
    This token can be used to call care.
    */

  const JWKeys = fs.readFileSync("keys.json");

  const keyStore = await jose.JWK.asKeyStore(JWKeys.toString());

  const [key] = keyStore.all({ use: "sig" });

  const opt = { compact: true, jwk: key, fields: { typ: "jwt" } };

  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000 + 60),
    iat: Math.floor(Date.now() / 1000),
    ...claims,
  });

  const token = await jose.JWS.createSign(opt, key).update(payload).final();

  return token;
};
