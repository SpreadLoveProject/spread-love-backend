import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

import { signToken, verifyToken } from "./jwt.js";

vi.mock("./env.js", () => ({
  default: {
    JWT_SECRET: "test-jwt-secret",
  },
}));

const TEST_SECRET = "test-jwt-secret";

describe("jwt", () => {
  describe("signToken", () => {
    it("페이로드와 만료시간으로 JWT를 생성한다", () => {
      const token = signToken({ guestId: "guest-123" }, "1h");

      expect(typeof token).toBe("string");

      const decoded = jwt.decode(token);
      expect(decoded.guestId).toBe("guest-123");
      expect(decoded.exp).toBeDefined();
    });

    it("다른 페이로드는 다른 토큰을 생성한다", () => {
      const token1 = signToken({ guestId: "guest-1" }, "1h");
      const token2 = signToken({ guestId: "guest-2" }, "1h");

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("유효한 토큰을 검증하고 페이로드를 반환한다", () => {
      const token = signToken({ guestId: "guest-123" }, "1h");
      const decoded = verifyToken(token);

      expect(decoded.guestId).toBe("guest-123");
    });

    it("만료된 토큰은 TokenExpiredError를 발생시킨다", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 10;
      const token = jwt.sign({ guestId: "guest-123", exp: pastExp }, TEST_SECRET);

      expect(() => verifyToken(token)).toThrow(
        expect.objectContaining({ name: "TokenExpiredError" }),
      );
    });

    it("유효하지 않은 토큰은 JsonWebTokenError를 발생시킨다", () => {
      expect(() => verifyToken("invalid-token")).toThrow(
        expect.objectContaining({ name: "JsonWebTokenError" }),
      );
    });
  });
});
