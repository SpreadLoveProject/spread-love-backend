import express from "express";

import * as historyController from "../controllers/historyController.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", [authenticate, requireAuth], historyController.getHistories);
router.get("/:id", [authenticate, requireAuth], historyController.getHistoryById);
router.delete("/:id", [authenticate, requireAuth], historyController.deleteHistory);

export default router;
