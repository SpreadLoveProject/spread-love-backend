import { beforeEach, describe, expect, it, vi } from "vitest";

import { redis } from "../config/redis.js";
import { RATE_LIMIT } from "../constants/common.js";
import { getRateLimitInfo } from "../utils/rateLimitUtils.js";
import { rateLimit } from "./rateLimit.js";

vi.mock("../config/redis.js", () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

vi.mock("../utils/rateLimitUtils.js", () => ({
  getRateLimitInfo: vi.fn(),
}));

describe("rateLimit", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { userId: "user-123" };
    mockRes = {};
    mockNext = vi.fn();
  });

  it("id가 없으면 AUTH_TOKEN_REQUIRED 에러를 던진다", async () => {
    getRateLimitInfo.mockReturnValue({ id: null, limit: 3, key: "key" });

    await expect(rateLimit(mockReq, mockRes, mockNext)).rejects.toThrow(
      expect.objectContaining({ code: "AUTH_TOKEN_REQUIRED" }),
    );
  });

  it("첫 번째 요청이면 TTL을 설정하고 next를 호출한다", async () => {
    getRateLimitInfo.mockReturnValue({
      id: "user-123",
      limit: 6,
      key: "rate_limit:user:user-123",
    });
    redis.incr.mockResolvedValue(1);

    await rateLimit(mockReq, mockRes, mockNext);

    expect(redis.expire).toHaveBeenCalledWith("rate_limit:user:user-123", RATE_LIMIT.TTL);
    expect(mockNext).toHaveBeenCalled();
  });

  it("요청 횟수가 제한 이내이면 next를 호출한다", async () => {
    getRateLimitInfo.mockReturnValue({
      id: "user-123",
      limit: 6,
      key: "rate_limit:user:user-123",
    });
    redis.incr.mockResolvedValue(3);

    await rateLimit(mockReq, mockRes, mockNext);

    expect(redis.expire).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("요청 횟수가 제한과 동일하면 통과한다", async () => {
    getRateLimitInfo.mockReturnValue({
      id: "user-123",
      limit: 6,
      key: "rate_limit:user:user-123",
    });
    redis.incr.mockResolvedValue(6);

    await rateLimit(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("요청 횟수가 제한을 초과하면 RATE_LIMIT_EXCEEDED 에러를 던지고 expire를 호출하지 않는다", async () => {
    getRateLimitInfo.mockReturnValue({
      id: "user-123",
      limit: 6,
      key: "rate_limit:user:user-123",
    });
    redis.incr.mockResolvedValue(7);

    await expect(rateLimit(mockReq, mockRes, mockNext)).rejects.toThrow(
      expect.objectContaining({ code: "RATE_LIMIT_EXCEEDED" }),
    );
    expect(redis.expire).not.toHaveBeenCalled();
  });

  it("Redis 장애 시 에러가 전파된다", async () => {
    getRateLimitInfo.mockReturnValue({
      id: "user-123",
      limit: 6,
      key: "rate_limit:user:user-123",
    });
    redis.incr.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(rateLimit(mockReq, mockRes, mockNext)).rejects.toThrow("ECONNREFUSED");
  });
});
