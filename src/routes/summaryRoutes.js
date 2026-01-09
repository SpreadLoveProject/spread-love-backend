import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), handleUploadError, authMiddleware, createSummary);

export default router;
