import { describe, expect, it, vi } from "vitest";

import { signToken, verifyToken } from "../config/jwt.js";
import { redis } from "../config/redis.js";
import { GUEST_TOKEN, RATE_LIMIT } from "../constants/common.js";
import { getRemaining, issueOrReuseGuestToken } from "./authService.js";

vi.mock("../config/jwt.js", () => ({
  signToken: vi.fn(),
  verifyToken: vi.fn(),
}));

vi.mock("../config/logger.js", () => ({
  default: { debug: vi.fn() },
}));

vi.mock("../config/redis.js", () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
  },
}));

vi.mock("crypto", () => ({
  default: { randomUUID: vi.fn(() => "mock-uuid") },
}));

describe("authService", () => {
  describe("issueOrReuseGuestToken", () => {
    it("기존 토큰이 없으면 새 토큰을 발급한다", async () => {
      redis.get.mockResolvedValue(null);
      signToken.mockReturnValue("new-jwt-token");

      const result = await issueOrReuseGuestToken("192.168.1.1");

      expect(redis.get).toHaveBeenCalledWith(`${GUEST_TOKEN.IP_PREFIX}192.168.1.1`);
      expect(signToken).toHaveBeenCalledWith({ guestId: "mock-uuid" }, GUEST_TOKEN.EXPIRES_IN);
      expect(redis.setex).toHaveBeenCalledWith(
        `${GUEST_TOKEN.IP_PREFIX}192.168.1.1`,
        RATE_LIMIT.TTL,
        "new-jwt-token",
      );
      expect(result).toEqual({
        token: "guest_new-jwt-token",
        remaining: RATE_LIMIT.GUEST_LIMIT,
      });
    });

    it("기존 토큰이 유효하고 충분한 시간이 남아있으면 재사용한다", async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      redis.get.mockResolvedValueOnce("existing-jwt-token").mockResolvedValueOnce("1");
      verifyToken.mockReturnValue({ guestId: "existing-guest", exp: futureExp });

      const result = await issueOrReuseGuestToken("192.168.1.1");

      expect(result).toEqual({
        token: "guest_existing-jwt-token",
        remaining: RATE_LIMIT.GUEST_LIMIT - 1,
      });
      expect(signToken).not.toHaveBeenCalled();
    });

    it("기존 토큰의 남은 시간이 5분 이하면 새 토큰을 발급한다", async () => {
      const nearExp = Math.floor(Date.now() / 1000) + 60;
      redis.get.mockResolvedValueOnce("expiring-jwt-token");
      verifyToken.mockReturnValue({ guestId: "expiring-guest", exp: nearExp });
      signToken.mockReturnValue("new-jwt-token");

      const result = await issueOrReuseGuestToken("192.168.1.1");

      expect(signToken).toHaveBeenCalled();
      expect(result.token).toBe("guest_new-jwt-token");
      expect(result.remaining).toBe(RATE_LIMIT.GUEST_LIMIT);
    });

    it("기존 토큰 검증 실패 시 새 토큰을 발급한다", async () => {
      redis.get.mockResolvedValueOnce("invalid-jwt-token");
      verifyToken.mockImplementation(() => {
        throw new Error("invalid token");
      });
      signToken.mockReturnValue("new-jwt-token");

      const result = await issueOrReuseGuestToken("192.168.1.1");

      expect(signToken).toHaveBeenCalled();
      expect(result.token).toBe("guest_new-jwt-token");
    });

    it("Redis 토큰 저장 실패 시 에러를 호출자에게 전파한다", async () => {
      redis.get.mockResolvedValue(null);
      signToken.mockReturnValue("new-jwt-token");
      redis.setex.mockRejectedValue(new Error("Redis 연결 실패"));

      await expect(issueOrReuseGuestToken("192.168.1.1")).rejects.toThrow("Redis 연결 실패");
    });

    it("사용 횟수가 없으면 remaining은 최대값이다", async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      redis.get.mockResolvedValueOnce("existing-jwt-token").mockResolvedValueOnce(null);
      verifyToken.mockReturnValue({ guestId: "existing-guest", exp: futureExp });

      const result = await issueOrReuseGuestToken("192.168.1.1");

      expect(result.remaining).toBe(RATE_LIMIT.GUEST_LIMIT);
    });
  });

  describe("getRemaining", () => {
    it("사용 횟수를 기반으로 남은 횟수를 반환한다", async () => {
      redis.get.mockResolvedValue("2");

      const remaining = await getRemaining("rate_limit:guest:id", 3);

      expect(remaining).toBe(1);
    });

    it("사용 횟수가 limit 이상이면 0을 반환한다", async () => {
      redis.get.mockResolvedValue("5");

      const remaining = await getRemaining("rate_limit:guest:id", 3);

      expect(remaining).toBe(0);
    });

    it("사용 횟수가 0이면 limit 전체를 반환한다", async () => {
      redis.get.mockResolvedValue("0");

      const remaining = await getRemaining("rate_limit:guest:id", 3);

      expect(remaining).toBe(3);
    });
  });
});
