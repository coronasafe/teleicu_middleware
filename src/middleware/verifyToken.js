import jose from "node-jose";
import jwktopem from "jwk-to-pem";
import jwt from "jsonwebtoken";
import axios from "axios";
import { verifyAuthToken } from "../utils/authUtils.js";

export const verify = async (req, res, next) => {
    try {
        const claims = verifyAuthToken(req.get("Authorization"));
        req.claims = claims;

        next();
    } catch (e) {
        const error = e.message;
        return res.status(401).send({
            status: "fail",
            message: error,
        });
    }
};
