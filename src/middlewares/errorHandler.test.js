import OpenAI from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import logger from "../config/logger.js";
import { ERROR_CONFIG } from "../constants/errorCodes.js";
import { AppError } from "../errors/AppError.js";
import { errorHandler } from "./errorHandler.js";

vi.mock("../config/logger.js", () => ({
  default: { error: vi.fn() },
}));

vi.mock("openai", () => {
  class RateLimitError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "RateLimitError";
    }
  }
  class AuthenticationError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "AuthenticationError";
    }
  }
  class APIConnectionError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "APIConnectionError";
    }
  }
  class APIError extends Error {
    constructor(msg) {
      super(msg);
      this.name = "APIError";
    }
  }

  return {
    default: class OpenAI {
      static RateLimitError = RateLimitError;
      static AuthenticationError = AuthenticationError;
      static APIConnectionError = APIConnectionError;
      static APIError = APIError;
    },
  };
});

describe("errorHandler", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  const expectErrorResponse = (code, status) => {
    expect(mockRes.status).toHaveBeenCalledWith(status);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: { code, message: ERROR_CONFIG[code].message },
    });
  };

  it("AppError를 처리한다", () => {
    const err = new AppError("AUTH_TOKEN_REQUIRED");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("AUTH_TOKEN_REQUIRED", 401);
  });

  it("TokenExpiredError를 처리한다", () => {
    const err = new Error("jwt expired");
    err.name = "TokenExpiredError";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("AUTH_TOKEN_EXPIRED", 401);
  });

  it("JsonWebTokenError를 처리한다", () => {
    const err = new Error("invalid token");
    err.name = "JsonWebTokenError";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("AUTH_TOKEN_INVALID", 401);
  });

  it("OpenAI RateLimitError를 처리한다", () => {
    const err = new OpenAI.RateLimitError("rate limit");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("OPENAI_RATE_LIMIT", 429);
  });

  it("OpenAI AuthenticationError를 처리한다", () => {
    const err = new OpenAI.AuthenticationError("auth error");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("OPENAI_AUTH_ERROR", 500);
  });

  it("OpenAI APIConnectionError를 처리한다", () => {
    const err = new OpenAI.APIConnectionError("timeout");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("OPENAI_TIMEOUT", 500);
  });

  it("OpenAI 할당량 초과 에러(code: insufficient_quota)를 OPENAI_INSUFFICIENT_QUOTA로 처리한다", () => {
    const err = new Error("quota exceeded");
    err.code = "insufficient_quota";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("OPENAI_INSUFFICIENT_QUOTA", 500);
  });

  it("OpenAI 결제 필요 에러(status: 402)를 OPENAI_INSUFFICIENT_QUOTA로 처리한다", () => {
    const err = new Error("payment required");
    err.status = 402;

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("OPENAI_INSUFFICIENT_QUOTA", 500);
  });

  it("OpenAI의 기타 API 에러(APIError)를 OPENAI_API_ERROR로 처리한다", () => {
    const err = new OpenAI.APIError("api error");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("OPENAI_API_ERROR", 500);
  });

  it("DB 에러 (PGRST 코드)를 처리한다", () => {
    const err = new Error("db error");
    err.code = "PGRST116";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("DB_ERROR", 500);
  });

  it("DB 에러 (22 코드 - 데이터 예외)를 처리한다", () => {
    const err = new Error("invalid uuid");
    err.code = "22P02";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("DB_ERROR", 500);
  });

  it("DB 에러 (23 코드 - 무결성 제약 위반)를 처리한다", () => {
    const err = new Error("unique violation");
    err.code = "23505";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("DB_ERROR", 500);
  });

  it("Redis 연결 에러를 처리한다", () => {
    const err = new Error("connect ECONNREFUSED");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("REDIS_ERROR", 500);
  });

  it("Redis 명령 응답 에러(ReplyError)를 REDIS_ERROR로 처리한다", () => {
    const err = new Error("WRONGTYPE");
    err.name = "ReplyError";

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("REDIS_ERROR", 500);
  });

  it("알 수 없는 에러는 SYSTEM_INTERNAL_ERROR로 처리한다", () => {
    const err = new Error("unknown error");

    errorHandler(err, mockReq, mockRes, mockNext);

    expectErrorResponse("SYSTEM_INTERNAL_ERROR", 500);
  });

  it("모든 에러에 대해 logger.error로 스택을 기록한다", () => {
    const err = new Error("some error");

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(logger.error).toHaveBeenCalledWith(err.stack);
  });
});
