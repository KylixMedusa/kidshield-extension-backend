import { Router } from "express";

import statsController from "../controllers/statsController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", authMiddleware, statsController.read);

const statsRouter = router;

export default statsRouter;
