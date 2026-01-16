export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
};

export const SUCCESS_MESSAGE = {
  HISTORY_DELETED: "히스토리가 삭제되었습니다.",
};

export const RATE_LIMIT = {
  TTL: 24 * 60 * 60,
  GUEST_LIMIT: 3,
  USER_LIMIT: 6,
  GUEST_PREFIX: "rate_limit:guest:",
  USER_PREFIX: "rate_limit:user:",
};

export const PUPPETEER = {
  VIEWPORT_WIDTH: 1280,
  VIEWPORT_HEIGHT: 800,
  PAGE_LOAD_TIMEOUT_MS: 30 * 1000,
  MAX_CAPTURE_HEIGHT: 8500,
};

export const CONCURRENCY = {
  MAX_CAPTURES: 3,
};

export const GUEST_TOKEN = {
  EXPIRES_IN: "24h",
};
