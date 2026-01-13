import express from "express";

import { createAnalysis } from "../controllers/analysisController.js";
import { checkToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", checkToken, createAnalysis);

export default router;
