import crypto from "crypto";

import { signToken } from "../config/jwt.js";
import { redis } from "../config/redis.js";
import { GUEST_TOKEN, RATE_LIMIT } from "../constants/common.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { getClientIP } from "../utils/ipUtils.js";

const issueGuestToken = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);

    if (!clientIP) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.IP_NOT_FOUND,
      });
    }

    const ipKey = `${GUEST_TOKEN.IP_PREFIX}${clientIP}`;
    const existingToken = await redis.get(ipKey);

    if (existingToken) {
      return res.json({
        success: true,
        data: { token: existingToken },
      });
    }

    const guestId = crypto.randomUUID();
    const token = signToken({ guestId }, GUEST_TOKEN.EXPIRES_IN);

    await redis.setex(ipKey, RATE_LIMIT.TTL, token);

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

const getRateLimit = async (req, res, next) => {
  try {
    const id = req.userId || req.guestId;
    const prefix = req.userId ? RATE_LIMIT.USER_PREFIX : RATE_LIMIT.GUEST_PREFIX;
    const limit = req.userId ? RATE_LIMIT.USER_LIMIT : RATE_LIMIT.GUEST_LIMIT;

    const key = `${prefix}${id}`;
    const currentCount = await redis.get(key);

    const remainingRequests = Math.max(0, limit - (Number(currentCount) || 0));

    res.set("RateLimit-Remaining", String(remainingRequests));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export { getRateLimit, issueGuestToken };
