import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { redis } from "../../src/config/redis.js";
import { supabase } from "../../src/config/supabase.js";

describe("GET /health", () => {
  it("모든 서비스가 정상이면 connected를 반환한다", async () => {
    supabase.auth.getSession.mockResolvedValue({ error: null });
    redis.ping.mockResolvedValue("PONG");

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "OK",
      supabase: "connected",
      redis: "connected",
    });
    expect(res.body.timestamp).toBeDefined();
  });

  it("Supabase 장애 시 disconnected를 반환한다", async () => {
    supabase.auth.getSession.mockResolvedValue({
      error: new Error("connection failed"),
    });
    redis.ping.mockResolvedValue("PONG");

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.supabase).toBe("disconnected");
    expect(res.body.redis).toBe("connected");
  });

  it("Redis 장애 시 disconnected를 반환한다", async () => {
    supabase.auth.getSession.mockResolvedValue({ error: null });
    redis.ping.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.supabase).toBe("connected");
    expect(res.body.redis).toBe("disconnected");
  });

  it("모든 서비스 장애 시 둘 다 disconnected를 반환한다", async () => {
    supabase.auth.getSession.mockRejectedValue(new Error("timeout"));
    redis.ping.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.supabase).toBe("disconnected");
    expect(res.body.redis).toBe("disconnected");
  });
});
