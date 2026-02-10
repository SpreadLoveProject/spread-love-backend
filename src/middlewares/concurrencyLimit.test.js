import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { concurrencyLimit } from "./concurrencyLimit.js";

vi.mock("../constants/common.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    CONCURRENCY: { MAX_CAPTURES: 2 },
  };
});

describe("concurrencyLimit", () => {
  let mockReq;
  let mockNext;
  let finishCallbacks;

  const createMockRes = () => ({
    on: vi.fn((event, cb) => {
      if (event === "finish") finishCallbacks.push(cb);
    }),
  });

  beforeEach(() => {
    mockReq = {};
    mockNext = vi.fn();
    finishCallbacks = [];
  });

  afterEach(() => {
    finishCallbacks.forEach((cb) => cb());
  });

  it("동시 요청이 제한 이하이면 next를 호출한다", () => {
    concurrencyLimit(mockReq, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("동시 요청이 제한을 초과하면 RATE_LIMIT_CONCURRENCY_EXCEEDED 에러를 던진다", () => {
    concurrencyLimit(mockReq, createMockRes(), mockNext);
    concurrencyLimit(mockReq, createMockRes(), mockNext);

    expect(() => concurrencyLimit(mockReq, createMockRes(), mockNext)).toThrow(
      expect.objectContaining({ code: "RATE_LIMIT_CONCURRENCY_EXCEEDED" }),
    );
  });

  it("응답 완료 시 activeRequests가 감소한다", () => {
    const finishOne = () => {
      const cb = finishCallbacks.shift();
      if (cb) cb();
    };

    concurrencyLimit(mockReq, createMockRes(), mockNext);
    concurrencyLimit(mockReq, createMockRes(), mockNext);

    expect(() => concurrencyLimit(mockReq, createMockRes(), mockNext)).toThrow();

    finishOne();

    expect(() => concurrencyLimit(mockReq, createMockRes(), mockNext)).not.toThrow();
  });
});
