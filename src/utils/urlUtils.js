import { AppError } from "../errors/AppError.js";

const BLOCKED_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
];

const BLOCKED_HOSTS = ["localhost", "[::1]", "[::ffff:169.254.169.254]"];

export const assertExternalUrl = (url) => {
  const { hostname } = new URL(url);

  if (BLOCKED_HOSTS.includes(hostname) || BLOCKED_PATTERNS.some((p) => p.test(hostname))) {
    throw new AppError("VALIDATION_URL_INVALID");
  }
};
