import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { authenticate } from "../middlewares/auth.js";
import { concurrencyLimit } from "../middlewares/concurrencyLimit.js";
import { rateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [authenticate, rateLimit, concurrencyLimit], createSummary);

export default router;
