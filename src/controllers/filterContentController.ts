import filterContentService from "../services/filterContentService";
import statService from "../services/statService";
import {
  RequestWithAuth,
  ResponseGenerator,
  ResponseStatus,
  ResponseWithBody,
} from "../utils/ResponseGenerator";
import { FilterContentValidator } from "../validators";

class FilterContentController {
  filterContent = async (
    req: RequestWithAuth<any, any, FilterContentValidator.FilterContentRequest>,
    res: ResponseWithBody<FilterContentValidator.FilterContentResponse>
  ) => {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    const { dom, images } = req.body;
    const rephrasedNodes = await filterContentService.filterContent(
      dom,
      images
    );

    await statService.updateStats(req.userId, {
      totalBlockedImages: rephrasedNodes.images.length,
      totalFilteredVisits:
        rephrasedNodes.images.length || rephrasedNodes.modifications.length
          ? 1
          : 0,
    });

    ResponseGenerator.sendResponse(
      res,
      ResponseStatus.SUCCESS,
      "Success",
      rephrasedNodes
    );
  };
}

export default new FilterContentController();
