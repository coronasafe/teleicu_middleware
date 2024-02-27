import Tokens from "csrf";
import { NextFunction, Request, Response } from "express";
import type { RequestHandler } from "express";

const csrf = new Tokens();

const safeMethods = ["GET", "HEAD", "OPTIONS", "TRACE"];

/**
 * Middleware function that provides CSRF protection.
 * It checks the request method and verifies the CSRF token.
 * If the request method is safe (GET, HEAD, OPTIONS), it generates a new CSRF token if not already present.
 * If the request method is not safe, it verifies the CSRF token in the request body.
 * If the CSRF token is invalid, it sends a 403 Forbidden response.
 * @returns {RequestHandler} The CSRF protection middleware function.
 */
export const csrfProtection = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const secret = req.cookies["csrf-secret"];
    if (safeMethods.includes(req.method)) {
      if (!secret) {
        try {
          const newSecret = csrf.secretSync();
          res.cookie("csrf-secret", newSecret);
          res.locals.csrfToken = csrf.create(newSecret);
        } catch (err) {
          return next(err);
        }
      } else {
        res.locals.csrfToken = csrf.create(secret);
      }
    } else {
      if (!csrf.verify(secret, req.body.csrfToken)) {
        return res.status(403).send("CSRF token invalid");
      }
    }
    next();
  };
};
