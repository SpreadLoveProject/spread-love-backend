import { AppError } from "../errors/AppError.js";
import { getRemaining, issueOrReuseGuestToken } from "../services/authService.js";
import { getClientIP } from "../utils/ipUtils.js";
import { getRateLimitInfo } from "../utils/rateLimitUtils.js";

const issueGuestToken = async (req, res) => {
  const clientIP = getClientIP(req);

  if (!clientIP) {
    throw new AppError("VALIDATION_IP_NOT_FOUND");
  }

  const { token, remaining } = await issueOrReuseGuestToken(clientIP);

  res.json({
    success: true,
    data: {
      token,
      rateLimit: { remaining },
    },
  });
};

const getRateLimit = async (req, res) => {
  const { limit, key } = getRateLimitInfo(req);
  const remaining = await getRemaining(key, limit);

  res.json({
    success: true,
    data: { remaining },
  });
};

export { getRateLimit, issueGuestToken };
