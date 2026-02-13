import { redis } from "../config/redis.js";
import { RATE_LIMIT } from "../constants/common.js";
import { AppError } from "../errors/AppError.js";
import { getRateLimitInfo } from "../utils/rateLimitUtils.js";

const rateLimit = async (req, res, next) => {
  const { id, limit, key } = getRateLimitInfo(req);

  if (!id) {
    throw new AppError("AUTH_TOKEN_REQUIRED");
  }

  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, RATE_LIMIT.TTL);
  }

  if (currentCount > limit) {
    throw new AppError("RATE_LIMIT_EXCEEDED");
  }

  next();
};

export { rateLimit };
