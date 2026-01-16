import { redis } from "../config/redis.js";
import { RATE_LIMIT } from "../constants/common.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const rateLimit = async (req, res, next) => {
  try {
    const id = req.userId || req.guestId;

    if (!id) {
      return next();
    }

    const prefix = req.userId ? RATE_LIMIT.USER_PREFIX : RATE_LIMIT.GUEST_PREFIX;
    const limit = req.userId ? RATE_LIMIT.USER_LIMIT : RATE_LIMIT.GUEST_LIMIT;

    const key = `${prefix}${id}`;
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, RATE_LIMIT.TTL);
    }

    const remainingRequests = Math.max(0, limit - currentCount);
    res.set("RateLimit-Remaining", String(remainingRequests));

    if (currentCount > limit) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { rateLimit };
