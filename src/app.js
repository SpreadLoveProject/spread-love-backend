import cors from "cors";
import express from "express";

import env from "./config/env.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "./constants/errorCodes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/summaries", summaryRoutes);
app.use("/histories", historyRoutes);
app.use("/analyses", analysisRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (err.name === "TokenExpiredError") {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGE.TOKEN_EXPIRED,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGE.TOKEN_VERIFICATION_FAILED,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

export default app;
