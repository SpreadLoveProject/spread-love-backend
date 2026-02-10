import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyToken } from "../config/jwt.js";
import { supabase } from "../config/supabase.js";
import { AppError } from "../errors/AppError.js";
import { authenticate, requireAuth } from "./auth.js";

vi.mock("../config/jwt.js", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("../config/supabase.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("authMiddleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = vi.fn();
  });

  describe("authenticate", () => {
    it("토큰이 없으면 AUTH_TOKEN_REQUIRED 에러를 던진다", async () => {
      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_TOKEN_REQUIRED" }),
      );
    });

    it("Bearer 형식이 아니면 AUTH_TOKEN_REQUIRED 에러를 던진다", async () => {
      mockReq.headers.authorization = "Basic some-token";

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_TOKEN_REQUIRED" }),
      );
    });

    it("유효한 guest 토큰이면 req.guestId를 설정하고 next를 호출한다", async () => {
      mockReq.headers.authorization = "Bearer guest_valid-token";
      verifyToken.mockReturnValue({ guestId: "guest-123" });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.guestId).toBe("guest-123");
      expect(mockNext).toHaveBeenCalled();
    });

    it("만료된 guest 토큰이면 AUTH_GUEST_TOKEN_EXPIRED 에러를 던진다", async () => {
      mockReq.headers.authorization = "Bearer guest_expired-token";
      verifyToken.mockImplementation(() => {
        const error = new Error("jwt expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_GUEST_TOKEN_EXPIRED" }),
      );
    });

    it("guestId가 없는 guest 토큰이면 AUTH_GUEST_TOKEN_INVALID 에러를 던진다", async () => {
      mockReq.headers.authorization = "Bearer guest_no-guest-id";
      verifyToken.mockReturnValue({});

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_GUEST_TOKEN_INVALID" }),
      );
    });

    it("유효하지 않은 guest 토큰이면 AUTH_GUEST_TOKEN_INVALID 에러를 던진다", async () => {
      mockReq.headers.authorization = "Bearer guest_invalid-token";
      verifyToken.mockImplementation(() => {
        const error = new Error("invalid token");
        error.name = "JsonWebTokenError";
        throw error;
      });

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_GUEST_TOKEN_INVALID" }),
      );
    });

    it("verifyToken이 AppError를 던지면 그대로 전파된다", async () => {
      mockReq.headers.authorization = "Bearer guest_some-token";
      verifyToken.mockImplementation(() => {
        throw new AppError("AUTH_GUEST_TOKEN_INVALID");
      });

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_GUEST_TOKEN_INVALID" }),
      );
    });

    it("유효한 user 토큰이면 req.userId를 설정하고 next를 호출한다", async () => {
      mockReq.headers.authorization = "Bearer user_valid-token";
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
      expect(mockReq.userId).toBe("user-123");
      expect(mockNext).toHaveBeenCalled();
    });

    it("만료된 user 토큰이면 AUTH_USER_TOKEN_EXPIRED 에러를 던진다", async () => {
      mockReq.headers.authorization = "Bearer user_expired-token";
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Token expired" },
      });

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_USER_TOKEN_EXPIRED" }),
      );
    });

    it("유효하지 않은 user 토큰이면 AUTH_USER_TOKEN_INVALID 에러를 던진다", async () => {
      mockReq.headers.authorization = "Bearer user_invalid-token";
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      });

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_USER_TOKEN_INVALID" }),
      );
    });

    it("알 수 없는 토큰 형식이면 AUTH_TOKEN_TYPE_UNKNOWN 에러를 던진다", async () => {
      mockReq.headers.authorization = "Bearer unknown_token";

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow(
        expect.objectContaining({ code: "AUTH_TOKEN_TYPE_UNKNOWN" }),
      );
    });

    it("supabase.auth.getUser가 reject되면 에러가 전파된다", async () => {
      mockReq.headers.authorization = "Bearer user_valid-token";
      supabase.auth.getUser.mockRejectedValue(new Error("network error"));

      await expect(authenticate(mockReq, mockRes, mockNext)).rejects.toThrow("network error");
    });
  });

  describe("requireAuth", () => {
    it("userId가 있으면 next를 호출한다", () => {
      mockReq.userId = "user-123";

      requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("userId가 없으면 AUTH_LOGIN_REQUIRED 에러를 던진다", () => {
      expect(() => requireAuth(mockReq, mockRes, mockNext)).toThrow(
        expect.objectContaining({ code: "AUTH_LOGIN_REQUIRED" }),
      );
    });
  });
});
