import app from "./app.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`서버가 포트 ${env.PORT}에서 실행 중입니다`);
    });
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
};

startServer();
