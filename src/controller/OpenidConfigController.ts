import type { Request, Response } from "express";

import { getJWKs } from "@/lib/jose";

export class OpenidConfigController {
  static publicJWKs = async (req: Request, res: Response) => {
    getJWKs().then((key) => {
      res
        .status(200)
        .header({ "Content-Type": "application/json; charset=utf-8" })
        .send(key);
    });
  };
}
