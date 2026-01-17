import { RATE_LIMIT } from "../constants/common.js";

const getRateLimitInfo = (req) => {
  const id = req.userId || req.guestId;
  const prefix = req.userId ? RATE_LIMIT.USER_PREFIX : RATE_LIMIT.GUEST_PREFIX;
  const limit = req.userId ? RATE_LIMIT.USER_LIMIT : RATE_LIMIT.GUEST_LIMIT;
  const key = `${prefix}${id}`;

  return { id, prefix, limit, key };
};

export { getRateLimitInfo };
