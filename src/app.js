import cors from "cors";
import express from "express";

import env from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";

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

app.use((err, req, res, _next) => {
  console.error(err.stack); // eslint-disable-line no-console
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
