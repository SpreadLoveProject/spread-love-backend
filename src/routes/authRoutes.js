import express from "express";

import { issueGuestToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/guest", issueGuestToken);

export default router;
