import type { NextFunction, Request, Response } from "express";
import { type ValidationChain, validationResult } from "express-validator";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      status: "fail",
      errors: errors.array().map((e) => ({ message: e.msg, param: e.param })),
    });
  };
};
