import jwt from "jsonwebtoken";

import env from "../../src/config/env.js";

export const createGuestToken = (guestId = "test-guest-id") => {
  const token = jwt.sign({ guestId }, env.JWT_SECRET, { expiresIn: "24h" });
  return `Bearer guest_${token}`;
};

export const createExpiredGuestToken = (guestId = "test-guest-id") => {
  const token = jwt.sign({ guestId }, env.JWT_SECRET, { expiresIn: "-1s" });
  return `Bearer guest_${token}`;
};

export const createUserToken = () => {
  return "Bearer user_test-supabase-token";
};
