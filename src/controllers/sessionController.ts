import { WithId } from "mongodb";

import sessionService from "../services/sessionService";
import {
  RequestWithAuth,
  ResponseGenerator,
  ResponseStatus,
  ResponseWithBody,
} from "../utils/ResponseGenerator";
import { SessionValidator } from "../validators";

class SessionController {
  async create(
    req: RequestWithAuth<any, any, SessionValidator.CreateSessionRequest>,
    res: ResponseWithBody<string>
  ) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      const session = await sessionService.createSession({
        ...req.body,
        userId: req.userId,
        createdAt: new Date().toISOString(),
      });
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "Session created successfully!",
        session.insertedId.toHexString()
      );
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }

  async read(
    req: RequestWithAuth<any, any, any, SessionValidator.ReadSessionsRequest>,
    res: ResponseWithBody<WithId<SessionValidator.ReadSessionsResponse>[]>
  ) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      const sessions = await sessionService.getSessions(req.userId, req.query);
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "Success",
        sessions
      );
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }

  async delete(
    req: RequestWithAuth<SessionValidator.DeleteSessionRequest>,
    res: ResponseWithBody<string>
  ) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      await sessionService.deleteSession(req.userId, req.params.sessionId);
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "Session deleted successfully!"
      );
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }
}

export default new SessionController();
