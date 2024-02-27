import type { NextFunction, Request, Response } from "express";
import type { RequestHandler } from "express";

import { JWTValidator, verifyCareJWT, verifyJWT } from "@/lib/jose";

type Bearer = "Bearer" | "Care_Bearer";

/**
 * Middleware to verify JWT token in the request header.
 * @param bearer The token bearer type (e.g., "Bearer").
 * @param jwtValidator The function to validate the JWT token.
 * @returns {RequestHandler} Express middleware function.
 */
export const jwtHeaderVerify = (
  bearer: Bearer,
  jwtValidator: JWTValidator,
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({ message: "Authorization header missing" });
      return;
    }

    const [type, jwt] = token.split(" ");

    if (type !== bearer) {
      res.status(401).json({ message: "Invalid token bearer" });
      return;
    }

    try {
      const payload = await jwtValidator(jwt);
      req.user = {};
      req.user.jwtClaims = payload;
      if (payload.sub) {
        req.user.id = payload.sub;
      }
      next();
    } catch (error: any) {
      res
        .status(401)
        .json({ message: `Token verification failed: ${error.code}` });
    }
  };
};

/**
 * Middleware function for authenticating care JWT.
 * It verifies api requests from care backend.
 * @returns {RequestHandler} The middleware function for authenticating care JWT.
 */
export const careJwtAuth = (): RequestHandler => {
  return jwtHeaderVerify("Care_Bearer", verifyCareJWT);
};

/**
 * Middleware function for JWT session authentication.
 * This function checks if a JWT token exists in the request cookies.
 * If the token is present, it verifies the token and attaches the user information to the request object.
 * If the token is not present or invalid, it redirects the user to the "/unauthorized" page.
 * @returns {RequestHandler} Express middleware function
 */
export const jwtAuth = (): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if (!token) {
      res.redirect("/unauthorized");
      return;
    }

    try {
      const payload = await verifyJWT(token);
      req.user = {};
      req.user.jwtClaims = payload;
      if (payload.sub) {
        req.user.id = payload.sub;
      }
      next();
    } catch (error: any) {
      res.redirect("/unauthorized");
      return;
    }
  };
};

/**
 * Middleware function for JWT authentication without verification.
 * Extracts the JWT token from the request cookies, verifies it,
 * and attaches the user information to the request object.
 * @returns {RequestHandler} Express middleware function
 */
export const jwtAuthNoVerify = (): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if (token) {
      try {
        const payload = await verifyJWT(token);
        req.user = {};
        req.user.jwtClaims = payload;
        if (payload.sub) {
          req.user.id = payload.sub;
        }
      } catch (error: any) {
        console.log(error);
      }
    }
    next();
  };
};
