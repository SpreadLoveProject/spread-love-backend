import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { redis } from "./config/redis.js";

const server = app.listen(env.PORT, () => {
  logger.info(`서버가 포트 ${env.PORT}에서 실행 중입니다`);
});

const shutdown = () => {
  logger.info("서버를 종료합니다...");
  server.close(() => {
    redis.quit();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
