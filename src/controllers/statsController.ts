import statService from "../services/statService";
import {
  RequestWithAuth,
  ResponseGenerator,
  ResponseStatus,
  ResponseWithBody,
} from "../utils/ResponseGenerator";
import { StatsValidator } from "../validators";

class StatsController {
  async read(
    req: RequestWithAuth,
    res: ResponseWithBody<StatsValidator.StatValues>
  ) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      const stats = await statService.getStats(req.userId);
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "Success",
        stats
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

export default new StatsController();
