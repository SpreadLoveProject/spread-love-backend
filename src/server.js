import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";

const startServer = async () => {
  try {
    app.listen(env.PORT, () => {
      logger.info(`서버가 포트 ${env.PORT}에서 실행 중입니다`);
    });
  } catch (error) {
    logger.error(`서버 시작 실패: ${error.message}`);
    process.exit(1);
  }
};

startServer();
