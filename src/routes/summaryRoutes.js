import express from "express";

import { createSummary } from "../controllers/summaryController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), createSummary);

export default router;
