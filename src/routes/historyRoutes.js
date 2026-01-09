import express from "express";

import { getHistories } from "../controllers/historyController.js";

const router = express.Router();

router.get("/", getHistories);

export default router;
