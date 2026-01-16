import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { checkGuestToken, checkUserToken } from "../middlewares/auth.js";
import { concurrencyLimit } from "../middlewares/concurrencyLimit.js";
import { rateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [checkUserToken, checkGuestToken, rateLimit, concurrencyLimit], createSummary);

export default router;
