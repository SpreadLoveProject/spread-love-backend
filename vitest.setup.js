import { afterEach, beforeEach, vi } from "vitest";

const TEST_ENV = {
  NODE_ENV: "test",
  JWT_SECRET: "test-jwt-secret",
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  OPENAI_API_KEY: "test-openai-key",
  REDIS_URL: "redis://localhost:6379",
  PORT: "3000",
  CORS_ORIGIN: "http://localhost:5173",
};

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetAllMocks();
  Object.assign(process.env, TEST_ENV);
});

afterEach(() => {
  process.env = { ...originalEnv };
});
