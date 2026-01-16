import crypto from "crypto";

import { signToken } from "../config/jwt.js";
import { GUEST_TOKEN } from "../constants/common.js";

const issueGuestToken = (req, res, next) => {
  try {
    const guestId = crypto.randomUUID();
    const token = signToken({ guestId }, GUEST_TOKEN.EXPIRES_IN);

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

export { issueGuestToken };
