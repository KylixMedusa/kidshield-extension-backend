import filterContentService from "../services/filterContentService";
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
    const { dom, images } = req.body;
    const rephrasedNodes = await filterContentService.filterContent(
      dom,
      images
    );
    ResponseGenerator.sendResponse(
      res,
      ResponseStatus.SUCCESS,
      "Success",
      rephrasedNodes
    );
  };
}

export default new FilterContentController();
