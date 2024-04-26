import { Response } from "express";

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

export class ResponseGenerator {
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
