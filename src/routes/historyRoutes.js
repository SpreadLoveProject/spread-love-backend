import express from "express";

import * as historyController from "../controllers/historyController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, historyController.getHistories);
router.get("/:id", historyController.getHistoryById);

export default router;
