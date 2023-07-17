import jose from "node-jose";
import jwktopem from "jwk-to-pem";
import jwt from "jsonwebtoken";
import axios from "axios";

import { UnAuthorizedException } from "../Exception/UnAuthorizedException.js";

const AUTHORIZED_BEARER = "Care_Bearer";

export async function getKeyStore() {
    const keyStore = await axios.get(
        `${process.env.CARE_API}/.well-known/openid-configuration`
    );

    return JSON.stringify(keyStore.data);
}

export async function getPublicKey() {
    const ks = await getKeyStore();
    const keyStore = await jose.JWK.asKeyStore(ks);
    const publicKey = keyStore.toJSON();

    return publicKey;
}

export function getToken(tokenWithBearer) {
    const [tokenBearer, token] = tokenWithBearer.split(" ");

    if (AUTHORIZED_BEARER !== tokenBearer)
        throw new UnAuthorizedException("Bearer is not authorized");

    if (token === null) throw new UnAuthorizedException("JWT token expected");

    return token;
}

export async function verifyAuthToken(header) {
    const tokenWithBearer = header;

    if (!!tokenWithBearer)
        throw new UnAuthorizedException("Bearer token is expected");

    const token = getToken(tokenWithBearer);

    const data = await getPublicKey();

    const [firstKey] = data.keys;
    const publicKey = jwktopem(firstKey);

    return jwt.verify(token, publicKey);
}
