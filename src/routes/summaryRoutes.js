import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { checkToken } from "../middlewares/auth.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", [upload.single("image"), handleUploadError, checkToken], createSummary);

export default router;
