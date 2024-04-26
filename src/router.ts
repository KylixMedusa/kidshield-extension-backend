import "dotenv/config";

import { Router } from "express";

import { FilterContentControllers } from "./controllers";
import { validatorMiddleware } from "./middlewares/validators";
import { FilterContentValidators } from "./validators";

const router = Router();

router.get("/ping", (req, res) => {
  res.send("Hey the server works, Yayy!");
});

router.post(
  "/filter-content",
  validatorMiddleware(
    FilterContentValidators.FilterContentRequestSchema,
    "body"
  ),
  FilterContentControllers.filterContent
);

export default router;
