import { Request } from "express";

import { FilterContentServices } from "../services";
import {
  ResponseGenerator,
  ResponseWithBody,
} from "../utils/ResponseGenerator";
import { FilterContentValidators } from "../validators";

const filterContent = async (
  req: Request<any, any, FilterContentValidators.FilterContentRequest>,
  res: ResponseWithBody<FilterContentValidators.FilterContentResponse>
) => {
  const { dom, images } = req.body;
  const rephrasedNodes = await FilterContentServices.filterContent(dom, images);
  ResponseGenerator.sendResponse(res, 200, "Success", rephrasedNodes);
};

export default { filterContent };
