import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "../config/supabase.js";
import { healthCheck } from "./healthController.js";

vi.mock("../config/supabase.js", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
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
    it("Supabase 연결 성공 시 connected를 응답한다", async () => {
      supabase.auth.getSession.mockResolvedValue({ error: null });

      await healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "OK",
          timestamp: expect.any(Date),
          supabase: "connected",
        }),
      );
    });

    it("Supabase 연결 실패 시 disconnected를 응답한다", async () => {
      supabase.auth.getSession.mockResolvedValue({ error: new Error("fail") });

      await healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "OK",
          timestamp: expect.any(Date),
          supabase: "disconnected",
        }),
      );
    });

    it("Supabase 예외 발생 시에도 disconnected를 응답한다", async () => {
      supabase.auth.getSession.mockRejectedValue(new Error("network error"));

      await healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "OK",
          timestamp: expect.any(Date),
          supabase: "disconnected",
        }),
      );
    });
  });
});
