import express from "express";

import { createAnalysis } from "../controllers/analysisController.js";
import { checkToken } from "../middlewares/auth.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", [upload.single("image"), handleUploadError, checkToken], createAnalysis);

export default router;
