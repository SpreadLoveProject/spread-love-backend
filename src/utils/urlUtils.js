import { AppError } from "../errors/AppError.js";

const ARTICLE_URL_PATTERNS = [
  /v\.daum\.net\/v\//,
  /\/article\//,
  /\/news\//,
  /\/post\//,
  /\/entry\//,
  /\/blog\//,
];

export const isArticleUrl = (url) => ARTICLE_URL_PATTERNS.some((pattern) => pattern.test(url));

const BLOCKED_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
];

const BLOCKED_HOSTS = ["localhost", "[::1]", "[::ffff:a9fe:a9fe]"];

export const assertExternalUrl = (url) => {
  const { hostname } = new URL(url);

  if (BLOCKED_HOSTS.includes(hostname) || BLOCKED_PATTERNS.some((p) => p.test(hostname))) {
    throw new AppError("VALIDATION_URL_INVALID");
  }
};
