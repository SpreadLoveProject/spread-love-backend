import { beforeEach, vi } from "vitest";

vi.mock("../../src/config/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../src/config/redis.js", () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    ttl: vi.fn(),
    ping: vi.fn(),
    quit: vi.fn(),
  },
}));

vi.mock("../../src/config/supabase.js", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

vi.mock("../../src/config/openai.js", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("../../src/utils/puppeteerUtils.js", () => ({
  captureFullPage: vi.fn(),
}));

vi.mock("../../src/utils/imageUtils.js", () => ({
  urlToDataUrl: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
