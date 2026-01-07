import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), authMiddleware, createSummary);

export default router;
