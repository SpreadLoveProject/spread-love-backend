import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { checkToken } from "../middlewares/auth.js";
import { guestRateLimit } from "../middlewares/rateLimit.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  [guestRateLimit, upload.single("image"), handleUploadError, checkToken],
  createSummary,
);

export default router;
