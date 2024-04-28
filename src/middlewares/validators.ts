import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { ResponseGenerator, ResponseStatus } from "../utils/ResponseGenerator";

export const validatorMiddleware = (
  schema: z.ZodObject<any, any> | z.ZodArray<any>,
  key: "body" | "query" | "params" = "body"
) => {
  return (
    req: Request<unknown, unknown, unknown, unknown>,
    res: Response<unknown, any>,
    next: NextFunction
  ) => {
    try {
      schema.parse(req[key]);
      next();
    } catch (error: any) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.INVALID_TYPE,
        "Invalid request data. Please review and try again.",
        error.errors[0]
      );
    }
  };
};
