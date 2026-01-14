import { redis } from "../config/redis.js";
import { RATE_LIMIT } from "../constants/common.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const guestRateLimit = async (req, res, next) => {
  try {
    if (req.userId) {
      return next();
    }

    const guestId = req.get("Guest-Id");

    if (!guestId) {
      return next();
    }

    const key = `${RATE_LIMIT.GUEST_PREFIX}${guestId}`;
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, RATE_LIMIT.TTL);
    }

    const remainingRequests = Math.max(0, RATE_LIMIT.GUEST_LIMIT - currentCount);
    res.set("RateLimit-Remaining", String(remainingRequests));

    if (currentCount > RATE_LIMIT.GUEST_LIMIT) {
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

const userRateLimit = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next();
    }

    const key = `${RATE_LIMIT.USER_PREFIX}${req.userId}`;
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, RATE_LIMIT.TTL);
    }

    const remainingRequests = Math.max(0, RATE_LIMIT.USER_LIMIT - currentCount);
    res.set("RateLimit-Remaining", String(remainingRequests));

    if (currentCount > RATE_LIMIT.USER_LIMIT) {
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

export { guestRateLimit, userRateLimit };
