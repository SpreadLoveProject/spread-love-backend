import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { analyze } from "../services/analysisService.js";
import { createAnalysis } from "./analysisController.js";

vi.mock("../services/analysisService.js", () => ({
  analyze: vi.fn(),
}));

describe("analysisController", () => {
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

  describe("createAnalysis", () => {
    it("imageUrl이 없으면 VALIDATION_IMAGE_URL_REQUIRED 에러를 던진다", async () => {
      mockReq.body = {};

      await expect(createAnalysis(mockReq, mockRes)).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_IMAGE_URL_REQUIRED" }),
      );
    });

    it("imageUrl이 유효한 URL 형식이 아니면 VALIDATION_URL_INVALID 에러를 던진다", async () => {
      mockReq.body = { imageUrl: "not-a-valid-url" };

      await expect(createAnalysis(mockReq, mockRes)).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
      );
    });

    it("settings가 없으면 DEFAULT_SETTINGS를 사용한다", async () => {
      mockReq.body = { imageUrl: "https://example.com/img.png", pageUrl: "https://example.com" };
      analyze.mockResolvedValue({ analysis: "분석 결과" });

      await createAnalysis(mockReq, mockRes);

      expect(analyze).toHaveBeenCalledWith({
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        userId: "user-123",
        settings: DEFAULT_SETTINGS,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { analysis: "분석 결과" },
      });
    });

    it("성공 시 커스텀 settings로 분석하고 결과를 응답한다", async () => {
      const customSettings = { length: "long", persona: "professional" };
      mockReq.body = {
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        settings: customSettings,
      };
      analyze.mockResolvedValue({ analysis: "분석 결과" });

      await createAnalysis(mockReq, mockRes);

      expect(analyze).toHaveBeenCalledWith({
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        userId: "user-123",
        settings: customSettings,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { analysis: "분석 결과" },
      });
    });

    it("pageUrl이 없으면 undefined로 전달된다", async () => {
      mockReq.body = { imageUrl: "https://example.com/img.png" };
      analyze.mockResolvedValue({ analysis: "분석 결과" });

      await createAnalysis(mockReq, mockRes);

      expect(analyze).toHaveBeenCalledWith({
        imageUrl: "https://example.com/img.png",
        pageUrl: undefined,
        userId: "user-123",
        settings: DEFAULT_SETTINGS,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { analysis: "분석 결과" },
      });
    });

    it("서비스가 실패하면 에러가 전파된다", async () => {
      mockReq.body = { imageUrl: "https://example.com/img.png" };
      analyze.mockRejectedValue(new Error("OpenAI 요청 실패"));

      await expect(createAnalysis(mockReq, mockRes)).rejects.toThrow("OpenAI 요청 실패");
    });
  });
});
