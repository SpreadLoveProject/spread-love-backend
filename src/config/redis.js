import Redis from "ioredis";

import env from "./env.js";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL이 설정되지 않았습니다");
}

export const redis = new Redis(env.REDIS_URL);
