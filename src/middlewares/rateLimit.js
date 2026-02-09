import { redis } from "../config/redis.js";
import { RATE_LIMIT } from "../constants/common.js";
import { ERROR_CODE, ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { getRateLimitInfo } from "../utils/rateLimitUtils.js";

const rateLimit = async (req, res, next) => {
  try {
    const { id, limit, key } = getRateLimitInfo(req);

    if (!id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        errorCode: ERROR_CODE.TOKEN_REQUIRED,
        error: ERROR_MESSAGE.TOKEN_REQUIRED,
      });
    }

    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, RATE_LIMIT.TTL);
    }

    if (currentCount > limit) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        errorCode: ERROR_CODE.RATE_LIMIT_EXCEEDED,
        error: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { rateLimit };
