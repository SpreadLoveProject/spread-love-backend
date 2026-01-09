import cors from "cors";
import express from "express";

import env from "./config/env.js";
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

app.use("/health", healthRoutes);
app.use("/summaries", summaryRoutes);
app.use("/histories", historyRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

export default app;
