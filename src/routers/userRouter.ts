import { Router } from "express";

import userController from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";
import { validatorMiddleware } from "../middlewares/validators";
import { UserValidator } from "../validators";

const router = Router();

router.get("/", authMiddleware, userController.read);

router.patch(
  "/",
  authMiddleware,
  validatorMiddleware(UserValidator.UpdateUserSchema, "body"),
  userController.update
);

router.delete("/", authMiddleware, userController.delete);

const userRouter = router;

export default userRouter;
