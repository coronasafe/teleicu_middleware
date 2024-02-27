import { NextFunction, Request, Response } from "express";

/**
 * Middleware function to log incoming requests and outgoing responses for debugging.
 * @param req - The incoming request object.
 * @param res - The outgoing response object.
 * @param next - The next middleware function.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("<--Request Logger-->");
  console.log(req.method, req.url);
  console.log("REQUEST:", req);
  next();
  console.log("RESPONSE:", res);
  console.log("<!--Request Logger--!>");
};
