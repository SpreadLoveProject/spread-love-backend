import express from "express";

import { createAnalysis } from "../controllers/analysisController.js";
import { checkGuestToken, checkUserToken } from "../middlewares/auth.js";
import { rateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [checkUserToken, checkGuestToken, rateLimit], createAnalysis);

export default router;
