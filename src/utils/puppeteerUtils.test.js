import { describe, expect, it, vi } from "vitest";

import { PUPPETEER } from "../constants/common.js";
import { captureFullPage, capturePageWithText } from "./puppeteerUtils.js";

const createMockPage = (overrides = {}) => ({
  setViewport: vi.fn(),
  goto: vi.fn(),
  screenshot: vi.fn(() => Buffer.from("screenshot-data")),
  evaluate: vi.fn(() => "추출된 본문 텍스트"),
  title: vi.fn(() => "테스트 페이지 제목"),
  ...overrides,
});

const createMockBrowser = (page) => ({
  newPage: vi.fn(() => page),
  close: vi.fn(),
});

vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn(),
  },
}));

vi.mock("./urlUtils.js", () => ({
  assertExternalUrl: vi.fn(),
}));

const { default: puppeteer } = await import("puppeteer");

describe("puppeteerUtils", () => {
  describe("captureFullPage", () => {
    it("assertExternalUrl이 에러를 던지면 에러가 전파된다", async () => {
      const { assertExternalUrl } = await import("./urlUtils.js");
      const validationError = new Error("Invalid URL");
      assertExternalUrl.mockImplementationOnce(() => {
        throw validationError;
      });

      await expect(captureFullPage("http://localhost/page")).rejects.toThrow(validationError);
    });

    it("웹페이지를 스크린샷으로 캡처하고 base64 data URL을 반환한다", async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      const result = await captureFullPage("https://example.com");

      expect(result.imageDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.pageTitle).toBe("테스트 페이지 제목");
      expect(mockPage.setViewport).toHaveBeenCalledWith({
        width: PUPPETEER.VIEWPORT_WIDTH,
        height: PUPPETEER.VIEWPORT_HEIGHT,
      });
      expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", {
        waitUntil: "networkidle2",
        timeout: PUPPETEER.PAGE_LOAD_TIMEOUT_MS,
      });
      expect(mockPage.screenshot).toHaveBeenCalledWith({
        type: "png",
        clip: {
          x: 0,
          y: 0,
          width: PUPPETEER.VIEWPORT_WIDTH,
          height: PUPPETEER.MAX_CAPTURE_HEIGHT,
        },
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("존재하지 않는 도메인(DNS 실패)이면 VALIDATION_URL_INVALID를 던진다", async () => {
      const mockPage = createMockPage({
        goto: vi.fn(() => {
          throw new Error("net::ERR_NAME_NOT_RESOLVED");
        }),
      });
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await expect(captureFullPage("https://invalid.example")).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("페이지 로딩 시간 초과 시 PUPPETEER_PAGE_TIMEOUT을 던진다", async () => {
      const mockPage = createMockPage({
        goto: vi.fn(() => {
          throw new Error("Navigation Timeout Exceeded");
        }),
      });
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await expect(captureFullPage("https://slow.example.com")).rejects.toThrow(
        expect.objectContaining({ code: "PUPPETEER_PAGE_TIMEOUT" }),
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("브라우저 실행 실패 시 에러가 전파된다", async () => {
      puppeteer.launch.mockRejectedValue(new Error("Failed to launch browser"));

      await expect(captureFullPage("https://example.com")).rejects.toThrow(
        "Failed to launch browser",
      );
    });

    it("그 이외의 예상하지 못한 에러 시 PUPPETEER_CAPTURE_FAILED를 던진다", async () => {
      const mockPage = createMockPage({
        screenshot: vi.fn(() => {
          throw new Error("unknown puppeteer error");
        }),
      });
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await expect(captureFullPage("https://example.com")).rejects.toThrow(
        expect.objectContaining({ code: "PUPPETEER_CAPTURE_FAILED" }),
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe("capturePageWithText", () => {
    it("스크린샷과 본문 텍스트를 함께 반환한다", async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      const result = await capturePageWithText("https://example.com/news/123");

      expect(result.imageDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.pageTitle).toBe("테스트 페이지 제목");
      expect(result.pageText).toBe("추출된 본문 텍스트");
    });

    it("waitUntil: load 전략을 사용한다", async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await capturePageWithText("https://example.com/news/123");

      expect(mockPage.goto).toHaveBeenCalledWith(
        "https://example.com/news/123",
        expect.objectContaining({ waitUntil: "load" }),
      );
    });

    it("본문 텍스트가 빈 문자열이면 pageText를 null로 반환한다", async () => {
      const mockPage = createMockPage({ evaluate: vi.fn(() => "") });
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      const result = await capturePageWithText("https://example.com/news/123");

      expect(result.pageText).toBeNull();
    });

    it("페이지 로딩 시간 초과 시 PUPPETEER_PAGE_TIMEOUT을 던진다", async () => {
      const mockPage = createMockPage({
        goto: vi.fn(() => {
          throw new Error("Navigation Timeout Exceeded");
        }),
      });
      const mockBrowser = createMockBrowser(mockPage);
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await expect(capturePageWithText("https://example.com/news/123")).rejects.toThrow(
        expect.objectContaining({ code: "PUPPETEER_PAGE_TIMEOUT" }),
      );
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
