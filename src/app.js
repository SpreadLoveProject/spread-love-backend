import cors from "cors";
import express from "express";

import env from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
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

app.use(errorHandler);

export default app;
