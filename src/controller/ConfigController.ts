import type { Request, Response } from "express";

export class ConfigController {
  static updateConfig = (req: Request, res: Response) => {
    res.redirect("/config");
  };
  static renderUpdateConfig = (req: Request, res: Response) => {
    res.render("pages/config", {
      req,
      csrfToken: res.locals.csrfToken,
      hostname: "dev_middleware.coronasafe.live",
    });
  };
}
