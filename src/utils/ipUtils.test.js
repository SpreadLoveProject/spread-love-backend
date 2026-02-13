import { describe, expect, it } from "vitest";

import { getClientIP } from "./ipUtils.js";

describe("ipUtils", () => {
  describe("getClientIP", () => {
    it("x-forwarded-for 헤더에서 첫 번째 IP를 반환한다", () => {
      const req = { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } };

      expect(getClientIP(req)).toBe("1.2.3.4");
    });

    it("x-forwarded-for에 IP가 하나만 있어도 정상 반환한다", () => {
      const req = { headers: { "x-forwarded-for": "10.0.0.1" } };

      expect(getClientIP(req)).toBe("10.0.0.1");
    });

    it("x-forwarded-for가 없으면 req.ip를 반환한다", () => {
      const req = { headers: {}, ip: "192.168.1.1" };

      expect(getClientIP(req)).toBe("192.168.1.1");
    });

    it("x-forwarded-for 헤더의 IP 앞뒤 공백을 trim한다", () => {
      const req = { headers: { "x-forwarded-for": " 1.2.3.4 , 5.6.7.8" } };

      expect(getClientIP(req)).toBe("1.2.3.4");
    });

    it("IP가 없으면 null을 반환한다", () => {
      const req = { headers: {} };

      expect(getClientIP(req)).toBeNull();
    });
  });
});
