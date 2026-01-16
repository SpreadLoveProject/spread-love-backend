import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { checkToken } from "../middlewares/auth.js";
import { concurrencyLimit } from "../middlewares/concurrencyLimit.js";
import { guestRateLimit, userRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [checkToken, guestRateLimit, userRateLimit, concurrencyLimit], createSummary);

export default router;
