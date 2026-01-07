import express from "express";

import { createSummary } from "../controllers/summaryController.js";

const router = express.Router();

router.post("/", createSummary);

export default router;
