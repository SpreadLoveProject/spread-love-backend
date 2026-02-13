import Redis from "ioredis";

import env from "./env.js";
import logger from "./logger.js";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL이 설정되지 않았습니다");
}

export const redis = new Redis(env.REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  logger.info("Redis 연결 성공");
});

redis.on("error", (err) => {
  logger.error("Redis 연결 오류:", err);
});

redis.on("reconnecting", () => {
  logger.warn("Redis 재연결 중...");
});
