import crypto from "crypto";

import { signToken, verifyToken } from "../config/jwt.js";
import { redis } from "../config/redis.js";
import { GUEST_TOKEN, RATE_LIMIT } from "../constants/common.js";

const MIN_TOKEN_TIME_LEFT = 5 * 60;

const issueOrReuseGuestToken = async (clientIP) => {
  const ipKey = `${GUEST_TOKEN.IP_PREFIX}${clientIP}`;
  const existingToken = await redis.get(ipKey);

  if (existingToken) {
    try {
      const decoded = verifyToken(existingToken);

      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - now;

      if (timeLeft > MIN_TOKEN_TIME_LEFT) {
        const rateLimitKey = `${RATE_LIMIT.GUEST_PREFIX}${decoded.guestId}`;
        const used = await redis.get(rateLimitKey);

        return {
          token: `guest_${existingToken}`,
          remaining: Math.max(0, RATE_LIMIT.GUEST_LIMIT - (Number(used) || 0)),
        };
      }
    } catch (error) {
      console.debug("기존 토큰 검증 실패, 새 토큰 발급:", error.message);
    }
  }

  const guestId = crypto.randomUUID();
  const token = signToken({ guestId }, GUEST_TOKEN.EXPIRES_IN);

  const ttlSeconds = RATE_LIMIT.TTL;
  await redis.setex(ipKey, ttlSeconds, token);

  return {
    token: `guest_${token}`,
    remaining: RATE_LIMIT.GUEST_LIMIT,
  };
};

const getRemaining = async (key, limit) => {
  const currentCount = await redis.get(key);
  const used = Number(currentCount) || 0;

  return Math.max(0, limit - used);
};

export { getRemaining, issueOrReuseGuestToken };
