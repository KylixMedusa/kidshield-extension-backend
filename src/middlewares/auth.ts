import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ResponseGenerator, ResponseStatus } from "../utils/ResponseGenerator";

export const authMiddleware = (
  req: Request<unknown, unknown, unknown, unknown>,
  res: Response<unknown, any>,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.UNAUTHORIZED,
        "Unauthorized. Please provide a valid token."
      );
      return;
    }

    const strippedToken = token.replace("Bearer ", "");
    const jwtResp = jwt.verify(strippedToken, process.env.JWT_SECRET!);

    if (typeof jwtResp !== "string") {
      const userId: string = jwtResp.userId;

      // @ts-ignore
      req.userId = userId;
    } else {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.UNAUTHORIZED,
        "Unauthorized. Please provide a valid token."
      );
      return;
    }

    next();
  } catch (error) {
    ResponseGenerator.sendResponse(
      res,
      ResponseStatus.UNAUTHORIZED,
      "Unauthorized. Please provide a valid token."
    );
  }
};
