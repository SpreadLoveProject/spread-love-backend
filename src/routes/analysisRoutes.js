import express from "express";

import { createAnalysis } from "../controllers/analysisController.js";
import { checkToken } from "../middlewares/auth.js";
import { guestRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [guestRateLimit, checkToken], createAnalysis);

export default router;
