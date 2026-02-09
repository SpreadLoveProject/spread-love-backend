import express from "express";

import { createAnalysis } from "../controllers/analysisController.js";
import { authenticate } from "../middlewares/auth.js";
import { rateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/", [authenticate, rateLimit], createAnalysis);

export default router;
