import express from "express";

import { getRateLimit, issueGuestToken } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/guest", issueGuestToken);
router.get("/rate-limit", authenticate, getRateLimit);

export default router;
