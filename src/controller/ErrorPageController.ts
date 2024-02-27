import type { Request, Response } from "express";

export class ErrorPageController {
  static notFound = (req: Request, res: Response) => {
    res.status(404).render("pages/notFound", { req });
  };

  static unauthorized = (req: Request, res: Response) => {
    res.status(401).render("pages/unauthorized", { req });
  };
}
