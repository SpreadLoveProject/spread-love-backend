import express from "express";

import { getRateLimit, issueGuestToken } from "../controllers/authController.js";
import { checkGuestToken, checkUserToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/guest", issueGuestToken);
router.get("/rate-limit", [checkUserToken, checkGuestToken], getRateLimit);

export default router;
