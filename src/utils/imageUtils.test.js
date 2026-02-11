import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UPLOAD } from "../constants/common.js";
import { urlToDataUrl } from "./imageUtils.js";

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    png: vi.fn(() => ({
      toBuffer: vi.fn(() => Buffer.from("png-data")),
    })),
  })),
}));

vi.mock("./urlUtils.js", () => ({
  assertExternalUrl: vi.fn(),
}));

const createMockResponse = ({ ok = true, headers = {}, arrayBuffer } = {}) => {
  const defaultHeaders = {
    "content-type": "image/png",
    "content-length": "1024",
    ...headers,
  };
  return {
    ok,
    headers: {
      get: vi.fn((key) => defaultHeaders[key] ?? null),
    },
    arrayBuffer: arrayBuffer || vi.fn(() => Promise.resolve(new ArrayBuffer(8))),
  };
};

describe("imageUtils", () => {
  describe("urlToDataUrl", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    it("assertExternalUrl이 에러를 던지면 에러가 전파된다", async () => {
      const { assertExternalUrl } = await import("./urlUtils.js");
      const validationError = new Error("Invalid URL");
      assertExternalUrl.mockImplementationOnce(() => {
        throw validationError;
      });

      await expect(urlToDataUrl("http://localhost/img.png")).rejects.toThrow(validationError);
    });

    it("fetch 실패 시 IMAGE_FETCH_FAILED 에러를 던진다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(createMockResponse({ ok: false }))),
      );

      await expect(urlToDataUrl("https://example.com/img.png")).rejects.toThrow(
        expect.objectContaining({ code: "IMAGE_FETCH_FAILED" }),
      );
    });

    it("fetch 자체가 reject되면 에러가 전파된다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
      );

      await expect(urlToDataUrl("https://example.com/img.png")).rejects.toThrow("Failed to fetch");
    });

    it("content-type이 image가 아니면 VALIDATION_IMAGE_TYPE_INVALID 에러를 던진다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(createMockResponse({ headers: { "content-type": "text/html" } })),
        ),
      );

      await expect(urlToDataUrl("https://example.com/page.html")).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_IMAGE_TYPE_INVALID" }),
      );
    });

    it("content-type이 null이면 VALIDATION_IMAGE_TYPE_INVALID 에러를 던진다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(
            createMockResponse({ headers: { "content-type": null, "content-length": "100" } }),
          ),
        ),
      );

      await expect(urlToDataUrl("https://example.com/unknown")).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_IMAGE_TYPE_INVALID" }),
      );
    });

    it("content-length가 제한을 초과하면 VALIDATION_FILE_SIZE_EXCEEDED 에러를 던진다", async () => {
      const oversized = String(UPLOAD.MAX_FILE_SIZE + 1);
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(createMockResponse({ headers: { "content-length": oversized } })),
        ),
      );

      await expect(urlToDataUrl("https://example.com/big.png")).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_FILE_SIZE_EXCEEDED" }),
      );
    });

    it("실제 버퍼 크기가 제한을 초과하면 VALIDATION_FILE_SIZE_EXCEEDED 에러를 던진다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(
            createMockResponse({
              headers: { "content-length": null },
              arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(UPLOAD.MAX_FILE_SIZE + 1))),
            }),
          ),
        ),
      );

      await expect(urlToDataUrl("https://example.com/big.png")).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_FILE_SIZE_EXCEEDED" }),
      );
    });

    it("일반 이미지를 data URL로 변환하고 sharp를 호출하지 않는다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(createMockResponse())),
      );

      const result = await urlToDataUrl("https://example.com/img.png");

      expect(result).toMatch(/^data:image\/png;base64,/);
      expect(sharp).not.toHaveBeenCalled();
    });

    it("SVG URL은 sharp로 PNG 변환 후 data URL을 반환한다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(
            createMockResponse({
              headers: { "content-type": "image/svg+xml", "content-length": "500" },
            }),
          ),
        ),
      );

      const result = await urlToDataUrl("https://example.com/icon.svg");

      expect(result).toMatch(/^data:image\/png;base64,/);
      expect(sharp).toHaveBeenCalled();
    });

    it("URL이 .svg가 아니어도 content-type에 svg가 포함되면 sharp로 변환한다", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(
            createMockResponse({
              headers: { "content-type": "image/svg+xml", "content-length": "500" },
            }),
          ),
        ),
      );

      const result = await urlToDataUrl("https://example.com/image?format=vector");

      expect(result).toMatch(/^data:image\/png;base64,/);
      expect(sharp).toHaveBeenCalled();
    });
  });
});
