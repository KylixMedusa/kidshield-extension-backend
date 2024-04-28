import { Router } from "express";

import sessionController from "../controllers/sessionController";
import { authMiddleware } from "../middlewares/auth";
import { validatorMiddleware } from "../middlewares/validators";
import { SessionValidator } from "../validators";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validatorMiddleware(SessionValidator.ReadSessionsRequestSchema, "query"),
  sessionController.read
);

router.post(
  "/",
  authMiddleware,
  validatorMiddleware(SessionValidator.CreateSessionRequestSchema, "body"),
  sessionController.create
);

router.delete("/:sessionId", authMiddleware, sessionController.delete);

const sessionRouter = router;

export default sessionRouter;
