import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { checkToken } from "../middlewares/auth.js";
import { guestRateLimit, userRateLimit } from "../middlewares/rateLimit.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  [checkToken, guestRateLimit, userRateLimit, upload.single("image"), handleUploadError],
  createSummary,
);

export default router;
