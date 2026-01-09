import express from "express";

import { getHistories } from "../controllers/historyController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getHistories);

export default router;
