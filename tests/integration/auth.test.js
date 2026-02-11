import "./setup.js";

import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import env from "../../src/config/env.js";
import { redis } from "../../src/config/redis.js";
import { GUEST_TOKEN, RATE_LIMIT } from "../../src/constants/common.js";
import { createGuestToken } from "./tokenHelpers.js";

describe("POST /auth/guest", () => {
  it("기존 토큰이 없으면 새 토큰을 발급한다", async () => {
    redis.get.mockResolvedValue(null);
    redis.setex.mockResolvedValue("OK");

    const res = await request(app).post("/auth/guest").set("x-forwarded-for", "192.168.1.1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        token: expect.stringMatching(/^guest_/),
        rateLimit: {
          remaining: RATE_LIMIT.GUEST_LIMIT,
        },
      },
    });

    expect(redis.setex).toHaveBeenCalledWith(
      `${GUEST_TOKEN.IP_PREFIX}192.168.1.1`,
      RATE_LIMIT.TTL,
      expect.any(String),
    );
  });

  it("기존 토큰이 유효하면 재사용한다", async () => {
    const guestId = "existing-guest-id";
    const existingToken = jwt.sign({ guestId }, env.JWT_SECRET, { expiresIn: "24h" });

    redis.get.mockResolvedValueOnce(existingToken);
    redis.get.mockResolvedValueOnce("1");

    const res = await request(app).post("/auth/guest").set("x-forwarded-for", "192.168.1.1");

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe(`guest_${existingToken}`);
    expect(res.body.data.rateLimit.remaining).toBe(RATE_LIMIT.GUEST_LIMIT - 1);
  });

  it("기존 토큰이 5분 이하로 남았으면 새 토큰을 발급한다", async () => {
    const guestId = "expiring-guest-id";
    const expiringToken = jwt.sign({ guestId }, env.JWT_SECRET, { expiresIn: "1m" });

    redis.get.mockResolvedValue(expiringToken);
    redis.setex.mockResolvedValue("OK");

    const res = await request(app).post("/auth/guest").set("x-forwarded-for", "192.168.1.1");

    expect(res.status).toBe(200);
    expect(res.body.data.token).not.toBe(`guest_${expiringToken}`);
    expect(res.body.data.rateLimit.remaining).toBe(RATE_LIMIT.GUEST_LIMIT);
    expect(redis.setex).toHaveBeenCalled();
  });

  it("토큰 재사용 시 remaining을 정확히 계산한다", async () => {
    const guestId = "used-guest-id";
    const existingToken = jwt.sign({ guestId }, env.JWT_SECRET, { expiresIn: "24h" });

    redis.get.mockResolvedValueOnce(existingToken);
    redis.get.mockResolvedValueOnce("2");

    const res = await request(app).post("/auth/guest").set("x-forwarded-for", "192.168.1.1");

    expect(res.status).toBe(200);
    expect(res.body.data.rateLimit.remaining).toBe(RATE_LIMIT.GUEST_LIMIT - 2);
  });
});

describe("GET /auth/rate-limit", () => {
  it("Rate limit 잔여량을 조회한다", async () => {
    redis.get.mockResolvedValue("1");

    const res = await request(app).get("/auth/rate-limit").set("Authorization", createGuestToken());

    expect(res.status).toBe(200);
    expect(res.body.data.remaining).toBe(RATE_LIMIT.GUEST_LIMIT - 1);
  });

  it("미사용 시 최대 제한 횟수를 반환한다", async () => {
    redis.get.mockResolvedValue(null);

    const res = await request(app).get("/auth/rate-limit").set("Authorization", createGuestToken());

    expect(res.status).toBe(200);
    expect(res.body.data.remaining).toBe(RATE_LIMIT.GUEST_LIMIT);
  });
});
