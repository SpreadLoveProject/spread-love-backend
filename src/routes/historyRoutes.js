import express from "express";

import * as historyController from "../controllers/historyController.js";
import { checkUserToken, requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", [checkUserToken, requireAuth], historyController.getHistories);
router.get("/:id", [checkUserToken, requireAuth], historyController.getHistoryById);
router.delete("/:id", [checkUserToken, requireAuth], historyController.deleteHistory);

export default router;
