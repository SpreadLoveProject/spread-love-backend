import { describe, expect, it, vi } from "vitest";

import logger from "../config/logger.js";
import { openai } from "../config/openai.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { getSummaryPrompt } from "../utils/promptUtils.js";
import { captureFullPage, capturePageWithText } from "../utils/puppeteerUtils.js";
import { saveHistory } from "./historyService.js";
import { summarize } from "./summaryService.js";

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

vi.mock("../utils/puppeteerUtils.js", () => ({
  captureFullPage: vi.fn(),
  capturePageWithText: vi.fn(),
}));

vi.mock("../utils/jsonUtils.js", () => ({
  parseJsonResponse: vi.fn(),
}));

vi.mock("../utils/promptUtils.js", () => ({
  getSummaryPrompt: vi.fn(),
}));

vi.mock("./historyService.js", () => ({
  saveHistory: vi.fn(),
}));

const MOCK_SETTINGS = { length: "short", persona: "friendly" };
const MOCK_PARSED = { title: "테스트 제목", summary: "테스트 요약" };
const MOCK_JSON = JSON.stringify(MOCK_PARSED);

const setupMocks = () => {
  captureFullPage.mockResolvedValue({
    imageDataUrl: "data:image/png;base64,abc",
    pageTitle: "테스트 페이지",
  });
  getSummaryPrompt.mockReturnValue("system prompt");
  openai.chat.completions.create.mockResolvedValue({
    choices: [{ message: { content: MOCK_JSON } }],
  });
  parseJsonResponse.mockReturnValue(MOCK_PARSED);
};

describe("summaryService", () => {
  describe("summarize", () => {
    it("URL을 캡처하고 OpenAI에 요약을 요청한다", async () => {
      setupMocks();
      saveHistory.mockResolvedValue("history-1");

      const result = await summarize({
        url: "https://example.com",
        userId: "user-123",
        settings: MOCK_SETTINGS,
      });

      expect(captureFullPage).toHaveBeenCalledWith("https://example.com");
      expect(getSummaryPrompt).toHaveBeenCalledWith(MOCK_SETTINGS, null, "테스트 페이지");
      expect(openai.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "system prompt" },
          {
            role: "user",
            content: [{ type: "image_url", image_url: { url: "data:image/png;base64,abc" } }],
          },
        ],
      });
      expect(parseJsonResponse).toHaveBeenCalledWith(MOCK_JSON);
      expect(result).toEqual({
        title: "테스트 제목",
        summary: "테스트 요약",
        historyId: "history-1",
      });
    });

    it("userId가 없으면 historyId 없이 결과를 반환한다", async () => {
      setupMocks();

      const result = await summarize({
        url: "https://example.com",
        userId: null,
        settings: MOCK_SETTINGS,
      });

      expect(saveHistory).not.toHaveBeenCalled();
      expect(result).toEqual({
        title: "테스트 제목",
        summary: "테스트 요약",
      });
      expect(result).not.toHaveProperty("historyId");
    });

    it("userId가 있으면 히스토리를 저장하고 historyId를 포함하여 반환한다", async () => {
      setupMocks();
      saveHistory.mockResolvedValue("history-1");

      const result = await summarize({
        url: "https://example.com",
        userId: "user-123",
        settings: MOCK_SETTINGS,
      });

      expect(saveHistory).toHaveBeenCalledWith({
        userId: "user-123",
        url: "https://example.com",
        title: "테스트 제목",
        summary: "테스트 요약",
        contentType: "summary",
      });
      expect(result).toEqual({
        title: "테스트 제목",
        summary: "테스트 요약",
        historyId: "history-1",
      });
    });

    it("기사 URL이면 capturePageWithText를 사용하고 pageText를 프롬프트에 전달한다", async () => {
      const mockPageText = "기사 본문 내용";
      capturePageWithText.mockResolvedValue({
        imageDataUrl: "data:image/png;base64,abc",
        pageTitle: "기사 사이트",
        pageText: mockPageText,
      });
      getSummaryPrompt.mockReturnValue("system prompt");
      openai.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: MOCK_JSON } }],
      });
      parseJsonResponse.mockReturnValue(MOCK_PARSED);

      await summarize({
        url: "https://example.com/news/123",
        userId: null,
        settings: MOCK_SETTINGS,
      });

      expect(capturePageWithText).toHaveBeenCalledWith("https://example.com/news/123");
      expect(captureFullPage).not.toHaveBeenCalled();
      expect(getSummaryPrompt).toHaveBeenCalledWith(MOCK_SETTINGS, mockPageText, "기사 사이트");
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.arrayContaining([
                { type: "text", text: `[페이지 본문 텍스트]\n${mockPageText}` },
              ]),
            }),
          ]),
        }),
      );
    });

    it("페이지 캡처 실패 시 요약을 중단하고 에러를 호출자에게 전파한다", async () => {
      captureFullPage.mockRejectedValue(new Error("페이지 캡처 실패"));

      await expect(
        summarize({ url: "https://example.com", userId: "user-123", settings: MOCK_SETTINGS }),
      ).rejects.toThrow("페이지 캡처 실패");
    });

    it("OpenAI API 호출 실패 시 요약을 중단하고 에러를 호출자에게 전파한다", async () => {
      captureFullPage.mockResolvedValue({
        imageDataUrl: "data:image/png;base64,abc",
        pageTitle: "테스트 페이지",
      });
      getSummaryPrompt.mockReturnValue("system prompt");
      openai.chat.completions.create.mockRejectedValue(new Error("OpenAI 서버 에러"));

      await expect(
        summarize({ url: "https://example.com", userId: "user-123", settings: MOCK_SETTINGS }),
      ).rejects.toThrow("OpenAI 서버 에러");
    });

    it("saveHistory 실패 시 에러를 로깅하고 historyId를 null로 반환한다", async () => {
      setupMocks();
      saveHistory.mockRejectedValue(new Error("DB 저장 실패"));

      const result = await summarize({
        url: "https://example.com",
        userId: "user-123",
        settings: MOCK_SETTINGS,
      });

      expect(logger.error).toHaveBeenCalledWith("DB 저장 실패");
      expect(result).toEqual({
        title: "테스트 제목",
        summary: "테스트 요약",
        historyId: null,
      });
    });
  });
});
