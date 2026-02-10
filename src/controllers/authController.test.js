import { beforeEach, describe, expect, it, vi } from "vitest";

import { getRemaining, issueOrReuseGuestToken } from "../services/authService.js";
import { getClientIP } from "../utils/ipUtils.js";
import { getRateLimitInfo } from "../utils/rateLimitUtils.js";
import { getRateLimit, issueGuestToken } from "./authController.js";

vi.mock("../utils/ipUtils.js", () => ({
  getClientIP: vi.fn(),
}));

vi.mock("../utils/rateLimitUtils.js", () => ({
  getRateLimitInfo: vi.fn(),
}));

vi.mock("../services/authService.js", () => ({
  issueOrReuseGuestToken: vi.fn(),
  getRemaining: vi.fn(),
}));

describe("authController", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      headers: {},
      userId: null,
      guestId: null,
    };
    mockRes = {
      json: vi.fn(),
    };
  });

  describe("issueGuestToken", () => {
    it("IP가 없으면 VALIDATION_IP_NOT_FOUND 에러를 던진다", async () => {
      getClientIP.mockReturnValue(null);

      await expect(issueGuestToken(mockReq, mockRes)).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_IP_NOT_FOUND" }),
      );
    });

    it("새 게스트 토큰을 발급하고 응답한다", async () => {
      getClientIP.mockReturnValue("192.168.1.1");
      issueOrReuseGuestToken.mockResolvedValue({
        token: "guest_new-token",
        remaining: 3,
      });

      await issueGuestToken(mockReq, mockRes);

      expect(issueOrReuseGuestToken).toHaveBeenCalledWith("192.168.1.1");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: "guest_new-token",
          rateLimit: { remaining: 3 },
        },
      });
    });

    it("서비스가 실패하면 에러가 전파된다", async () => {
      getClientIP.mockReturnValue("192.168.1.1");
      issueOrReuseGuestToken.mockRejectedValue(new Error("Redis 장애"));

      await expect(issueGuestToken(mockReq, mockRes)).rejects.toThrow("Redis 장애");
    });
  });

  describe("getRateLimit", () => {
    it("남은 사용 횟수를 반환한다", async () => {
      mockReq.guestId = "guest-123";
      getRateLimitInfo.mockReturnValue({
        limit: 3,
        key: "rate_limit:guest:guest-123",
      });
      getRemaining.mockResolvedValue(2);

      await getRateLimit(mockReq, mockRes);

      expect(getRateLimitInfo).toHaveBeenCalledWith(mockReq);
      expect(getRemaining).toHaveBeenCalledWith("rate_limit:guest:guest-123", 3);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { remaining: 2 },
      });
    });

    it("userId가 있는 경우에도 올바르게 동작한다", async () => {
      mockReq.userId = "user-123";
      getRateLimitInfo.mockReturnValue({
        limit: 6,
        key: "rate_limit:user:user-123",
      });
      getRemaining.mockResolvedValue(5);

      await getRateLimit(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { remaining: 5 },
      });
    });

    it("서비스가 실패하면 에러가 전파된다", async () => {
      getRateLimitInfo.mockReturnValue({
        limit: 3,
        key: "rate_limit:guest:guest-123",
      });
      getRemaining.mockRejectedValue(new Error("Redis 장애"));

      await expect(getRateLimit(mockReq, mockRes)).rejects.toThrow("Redis 장애");
    });
  });
});
