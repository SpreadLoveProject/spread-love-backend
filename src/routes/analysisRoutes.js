import express from "express";

import { createAnalysis } from "../controllers/analysisController.js";
import { checkToken } from "../middlewares/auth.js";
import { guestRateLimit, userRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [checkToken, guestRateLimit, userRateLimit], createAnalysis);

export default router;
