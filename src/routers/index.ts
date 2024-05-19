import "dotenv/config";

import { Router } from "express";

import authController from "../controllers/authController";
import filterContentController from "../controllers/filterContentController";
import { authMiddleware } from "../middlewares/auth";
import { validatorMiddleware } from "../middlewares/validators";
import { AuthValidator, FilterContentValidator } from "../validators";
import sessionRouter from "./sessionRouter";
import statsRouter from "./statsRouter";
import userRouter from "./userRouter";

const router = Router();

router.get("/ping", (req, res) => {
  res.send("Hey the server works, Yayy!");
});

router.post(
  "/login",
  validatorMiddleware(AuthValidator.LoginSchema, "body"),
  authController.login
);

router.post(
  "/login-extension",
  validatorMiddleware(AuthValidator.LoginSchema, "body"),
  authController.loginExtension
);

router.post(
  "/register",
  validatorMiddleware(AuthValidator.RegisterSchema, "body"),
  authController.register
);

router.post(
  "/filter-content",
  authMiddleware,
  validatorMiddleware(
    FilterContentValidator.FilterContentRequestSchema,
    "body"
  ),
  filterContentController.filterContent
);

router.use("/user", userRouter);

router.use("/sessions", sessionRouter);

router.use("/stats", statsRouter);

export default router;
