import { beforeEach, describe, expect, it, vi } from "vitest";

import { redis } from "../config/redis.js";
import { supabase } from "../config/supabase.js";
import { healthCheck } from "./healthController.js";

vi.mock("../config/supabase.js", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("../config/redis.js", () => ({
  redis: {
    ping: vi.fn(),
  },
}));

describe("healthController", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe("healthCheck", () => {
    it("Supabase와 Redis 모두 정상이면 전부 connected 응답", async () => {
      supabase.auth.getSession.mockResolvedValue({ error: null });
      redis.ping.mockResolvedValue("PONG");

      await healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "OK",
          supabase: "connected",
          redis: "connected",
        }),
      );
    });

    it("Supabase 연결 실패 시 disconnected를 응답한다", async () => {
      supabase.auth.getSession.mockResolvedValue({ error: new Error("fail") });
      redis.ping.mockResolvedValue("PONG");

      await healthCheck(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          supabase: "disconnected",
          redis: "connected",
        }),
      );
    });

    it("Redis 연결 실패 시 disconnected를 응답한다", async () => {
      supabase.auth.getSession.mockResolvedValue({ error: null });
      redis.ping.mockRejectedValue(new Error("connection refused"));

      await healthCheck(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          supabase: "connected",
          redis: "disconnected",
        }),
      );
    });

    it("Supabase에서 예외가 발생한 경우에도 disconnected를 응답한다", async () => {
      supabase.auth.getSession.mockRejectedValue(new Error("network error"));
      redis.ping.mockResolvedValue("PONG");

      await healthCheck(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          supabase: "disconnected",
          redis: "connected",
        }),
      );
    });

    it("모든 서비스가 죽어도 200 OK와 함께 disconnected를 응답한다", async () => {
      supabase.auth.getSession.mockRejectedValue(new Error("fail"));
      redis.ping.mockRejectedValue(new Error("fail"));

      await healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "OK",
          supabase: "disconnected",
          redis: "disconnected",
        }),
      );
    });
  });
});
