import type { NextFunction, Request, Response } from "express";
import expressWs from "express-ws";

declare module "express-serve-static-core" {
  export interface Request {
    wsInstance: any;
  }
}

export const getWs =
  (ws: expressWs.Instance) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.wsInstance = ws;
    next();
  };
