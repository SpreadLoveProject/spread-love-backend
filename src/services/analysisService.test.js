import { describe, expect, it, vi } from "vitest";

import logger from "../config/logger.js";
import { openai } from "../config/openai.js";
import { urlToDataUrl } from "../utils/imageUtils.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { getAnalysisPrompt } from "../utils/promptUtils.js";
import { analyze } from "./analysisService.js";
import { saveHistory } from "./historyService.js";

vi.mock("../config/env.js", () => ({
  default: { OPENAI_MODEL: "gpt-4o" },
}));

vi.mock("../config/logger.js", () => ({
  default: { error: vi.fn() },
}));

vi.mock("../config/openai.js", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("../utils/imageUtils.js", () => ({
  urlToDataUrl: vi.fn(),
}));

vi.mock("../utils/jsonUtils.js", () => ({
  parseJsonResponse: vi.fn(),
}));

vi.mock("../utils/promptUtils.js", () => ({
  getAnalysisPrompt: vi.fn(),
}));

vi.mock("./historyService.js", () => ({
  saveHistory: vi.fn(),
}));

const MOCK_SETTINGS = { length: "long", persona: "professional" };
const MOCK_PARSED = { title: "이미지 분석 제목", summary: "이미지 분석 요약" };
const MOCK_JSON = JSON.stringify(MOCK_PARSED);

const setupMocks = () => {
  urlToDataUrl.mockResolvedValue("data:image/png;base64,xyz");
  getAnalysisPrompt.mockReturnValue("analysis prompt");
  openai.chat.completions.create.mockResolvedValue({
    choices: [{ message: { content: MOCK_JSON } }],
  });
  parseJsonResponse.mockReturnValue(MOCK_PARSED);
};

describe("analysisService", () => {
  describe("analyze", () => {
    it("이미지 URL을 변환하고 OpenAI에 분석을 요청한다", async () => {
      setupMocks();
      saveHistory.mockResolvedValue("history-1");

      const result = await analyze({
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        userId: "user-123",
        settings: MOCK_SETTINGS,
      });

      expect(urlToDataUrl).toHaveBeenCalledWith("https://example.com/img.png");
      expect(getAnalysisPrompt).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(openai.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "analysis prompt" },
          {
            role: "user",
            content: [{ type: "image_url", image_url: { url: "data:image/png;base64,xyz" } }],
          },
        ],
      });
      expect(parseJsonResponse).toHaveBeenCalledWith(MOCK_JSON);
      expect(result).toEqual({
        title: "이미지 분석 제목",
        summary: "이미지 분석 요약",
        historyId: "history-1",
      });
    });

    it("userId가 없으면 historyId 없이 결과를 반환한다", async () => {
      setupMocks();

      const result = await analyze({
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        userId: null,
        settings: MOCK_SETTINGS,
      });

      expect(saveHistory).not.toHaveBeenCalled();
      expect(result).toEqual({
        title: "이미지 분석 제목",
        summary: "이미지 분석 요약",
      });
      expect(result).not.toHaveProperty("historyId");
    });

    it("userId가 있으면 히스토리를 저장하고 historyId를 포함하여 반환한다", async () => {
      setupMocks();
      saveHistory.mockResolvedValue("history-2");

      const result = await analyze({
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        userId: "user-123",
        settings: MOCK_SETTINGS,
      });

      expect(saveHistory).toHaveBeenCalledWith({
        userId: "user-123",
        url: "https://example.com",
        title: "이미지 분석 제목",
        summary: "이미지 분석 요약",
        contentType: "analysis",
      });
      expect(result).toEqual({
        title: "이미지 분석 제목",
        summary: "이미지 분석 요약",
        historyId: "history-2",
      });
    });

    it("이미지 URL 변환 실패 시 분석을 중단하고 에러를 호출자에게 전파한다", async () => {
      urlToDataUrl.mockRejectedValue(new Error("이미지 변환 실패"));

      await expect(
        analyze({
          imageUrl: "https://example.com/img.png",
          pageUrl: "https://example.com",
          userId: "user-123",
          settings: MOCK_SETTINGS,
        }),
      ).rejects.toThrow("이미지 변환 실패");
    });

    it("OpenAI API 호출 실패 시 분석을 중단하고 에러를 호출자에게 전파한다", async () => {
      urlToDataUrl.mockResolvedValue("data:image/png;base64,xyz");
      getAnalysisPrompt.mockReturnValue("analysis prompt");
      openai.chat.completions.create.mockRejectedValue(new Error("OpenAI 서버 에러"));

      await expect(
        analyze({
          imageUrl: "https://example.com/img.png",
          pageUrl: "https://example.com",
          userId: "user-123",
          settings: MOCK_SETTINGS,
        }),
      ).rejects.toThrow("OpenAI 서버 에러");
    });

    it("saveHistory 실패 시 에러를 로깅하고 historyId를 null로 반환한다", async () => {
      setupMocks();
      saveHistory.mockRejectedValue(new Error("DB 저장 실패"));

      const result = await analyze({
        imageUrl: "https://example.com/img.png",
        pageUrl: "https://example.com",
        userId: "user-123",
        settings: MOCK_SETTINGS,
      });

      expect(logger.error).toHaveBeenCalledWith("DB 저장 실패");
      expect(result).toEqual({
        title: "이미지 분석 제목",
        summary: "이미지 분석 요약",
        historyId: null,
      });
    });
  });
});
