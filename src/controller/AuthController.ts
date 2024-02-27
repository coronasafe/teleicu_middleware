import type { Request, Response } from "express";

import { generateJWT } from "@/lib/jose";
import { adminPassword, adminUsername } from "@/utils/configs";

export class AuthController {
  static loginForm = async (req: Request, res: Response) => {
    res.render("pages/login", {
      req,
      errors: req.flash("error"),
    });
  };

  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (username === adminUsername && password === adminPassword) {
      const token = await generateJWT({ sub: "admin" }, "30m");
      res.cookie("jwt", token);
      res.redirect("/");
    } else {
      req.flash("error", "Invalid username or password");
      res.redirect("/auth/login");
    }
  };

  static logout = async (req: Request, res: Response) => {
    res.clearCookie("jwt");
    res.redirect("/auth/login");
  };
}
