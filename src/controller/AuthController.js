import { verifyAuthToken } from "../utils/authUtils.js";
import jwt from "jsonwebtoken";

export class AuthController {
  static SECRET_KEY = process.env.JWT_SECRET;

  static verifyToken = (req, res) => {
    const jwtToken = req.body.token;

    const status = this._validateJwt(jwtToken) ? "1" : "0";

    res.send({ status });
  };

  static _validateJwt = (token) => {
    if (!token) return false;
    return !!jwt.verify(token, this.SECRET_KEY);
  };

  static generateToken = (req, res) => {
    const claims = verifyAuthToken(req.get("Authorization"));

    const token = jwt.sign(claims, this.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).send({
      status: "success",
      data: {
        token,
      },
    });
  };
}
