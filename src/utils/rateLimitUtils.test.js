import { describe, expect, it } from "vitest";

import { RATE_LIMIT } from "../constants/common.js";
import { getRateLimitInfo } from "./rateLimitUtils.js";

describe("rateLimitUtils", () => {
  describe("getRateLimitInfo", () => {
    it("userId가 있으면 user 기준 정보를 반환한다", () => {
      const req = { userId: "user-123", guestId: null };

      const result = getRateLimitInfo(req);

      expect(result).toEqual({
        id: "user-123",
        prefix: RATE_LIMIT.USER_PREFIX,
        limit: RATE_LIMIT.USER_LIMIT,
        key: `${RATE_LIMIT.USER_PREFIX}user-123`,
      });
    });

    it("guestId만 있으면 guest 기준 정보를 반환한다", () => {
      const req = { userId: null, guestId: "guest-456" };

      const result = getRateLimitInfo(req);

      expect(result).toEqual({
        id: "guest-456",
        prefix: RATE_LIMIT.GUEST_PREFIX,
        limit: RATE_LIMIT.GUEST_LIMIT,
        key: `${RATE_LIMIT.GUEST_PREFIX}guest-456`,
      });
    });

    it("userId가 우선순위를 가진다", () => {
      const req = { userId: "user-123", guestId: "guest-456" };

      const result = getRateLimitInfo(req);

      expect(result).toEqual({
        id: "user-123",
        prefix: RATE_LIMIT.USER_PREFIX,
        limit: RATE_LIMIT.USER_LIMIT,
        key: `${RATE_LIMIT.USER_PREFIX}user-123`,
      });
    });

    it("userId와 guestId 모두 없으면 id가 falsy이다", () => {
      const req = { userId: null, guestId: null };

      const result = getRateLimitInfo(req);

      expect(result.id).toBeFalsy();
    });
  });
});
