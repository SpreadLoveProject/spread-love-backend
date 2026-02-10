import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { summarize } from "../services/summaryService.js";
import { createSummary } from "./summaryController.js";

vi.mock("../services/summaryService.js", () => ({
  summarize: vi.fn(),
}));

describe("summaryController", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      userId: "user-123",
    };
    mockRes = {
      json: vi.fn(),
    };
  });

  describe("createSummary", () => {
    it("url이 없으면 VALIDATION_URL_REQUIRED 에러를 던진다", async () => {
      mockReq.body = {};

      await expect(createSummary(mockReq, mockRes)).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_URL_REQUIRED" }),
      );
    });

    it("settings가 없으면 DEFAULT_SETTINGS를 사용한다", async () => {
      mockReq.body = { url: "https://example.com" };
      summarize.mockResolvedValue({ summary: "요약 결과" });

      await createSummary(mockReq, mockRes);

      expect(summarize).toHaveBeenCalledWith({
        url: "https://example.com",
        userId: "user-123",
        settings: DEFAULT_SETTINGS,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { summary: "요약 결과" },
      });
    });

    it("성공 시 커스텀 settings로 요약하고 결과를 응답한다", async () => {
      const customSettings = { length: "short", persona: "friendly" };
      mockReq.body = {
        url: "https://example.com",
        settings: customSettings,
      };
      summarize.mockResolvedValue({ summary: "요약 결과" });

      await createSummary(mockReq, mockRes);

      expect(summarize).toHaveBeenCalledWith({
        url: "https://example.com",
        userId: "user-123",
        settings: customSettings,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { summary: "요약 결과" },
      });
    });

    it("서비스가 실패하면 에러가 전파된다", async () => {
      mockReq.body = { url: "https://example.com" };
      summarize.mockRejectedValue(new Error("OpenAI 요청 실패"));

      await expect(createSummary(mockReq, mockRes)).rejects.toThrow("OpenAI 요청 실패");
    });
  });
});
