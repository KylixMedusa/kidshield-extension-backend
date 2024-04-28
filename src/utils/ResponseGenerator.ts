import { Request, Response } from "express";
import { ParsedQs } from "qs";

export enum ResponseStatus {
  SUCCESS = 200,
  PARTIAL_CONTENT = 206,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INVALID_TYPE = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export type ResponseWithBody<T> = Response<{
  message: string;
  result?: T;
}>;

interface ParamsDictionary {
  [key: string]: string;
}

export type RequestWithAuth<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = Request<P, ResBody, ReqBody, ReqQuery> & {
  userId?: string;
};

type ErrorWithMessage = {
  message: string;
};

export class ResponseGenerator {
  private static isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    );
  }

  private static toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (this.isErrorWithMessage(maybeError)) return maybeError;

    try {
      return new Error(JSON.stringify(maybeError));
    } catch {
      // fallback in case there's an error stringifying the maybeError
      // like with circular references for example.
      return new Error(String(maybeError));
    }
  }

  public static getErrorMessage(error: unknown) {
    return this.toErrorWithMessage(error).message;
  }

  public static sendResponse<T>(
    res: ResponseWithBody<T>,
    statusCode: ResponseStatus,
    message: string,
    result?: T
  ) {
    res.status(statusCode).json({
      message,
      result,
    });
  }
}
