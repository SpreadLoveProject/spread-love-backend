import express from "express";

import * as historyController from "../controllers/historyController.js";
import { checkToken, requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", [checkToken, requireAuth], historyController.getHistories);
router.get("/:id", [checkToken, requireAuth], historyController.getHistoryById);

export default router;
