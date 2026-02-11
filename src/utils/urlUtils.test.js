import { describe, expect, it } from "vitest";

import { assertExternalUrl } from "./urlUtils.js";

describe("assertExternalUrl", () => {
  it("외부 URL은 에러를 던지지 않는다", () => {
    expect(() => assertExternalUrl("https://google.com")).not.toThrow();
    expect(() => assertExternalUrl("https://example.com/page")).not.toThrow();
  });

  it("localhost는 VALIDATION_URL_INVALID 에러를 던진다", () => {
    expect(() => assertExternalUrl("http://localhost:3000")).toThrow(
      expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
    );
  });

  it("AWS 메타데이터 엔드포인트(169.254.x)는 VALIDATION_URL_INVALID 에러를 던진다", () => {
    expect(() => assertExternalUrl("http://169.254.169.254/latest/meta-data/")).toThrow(
      expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
    );
  });

  it("사설 IP(127, 10, 172, 192, 0)는 VALIDATION_URL_INVALID 에러를 던진다", () => {
    const privateUrls = [
      "http://127.0.0.1",
      "http://10.0.0.1",
      "http://172.16.0.1",
      "http://192.168.1.1",
      "http://0.0.0.0",
    ];

    privateUrls.forEach((url) => {
      expect(() => assertExternalUrl(url)).toThrow(
        expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
      );
    });
  });

  it("IPv6 루프백([::1])도 VALIDATION_URL_INVALID 에러를 던진다", () => {
    expect(() => assertExternalUrl("http://[::1]")).toThrow(
      expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
    );
  });

  it("IPv4-mapped IPv6로 AWS 메타데이터 우회도 VALIDATION_URL_INVALID 에러를 던진다", () => {
    expect(() => assertExternalUrl("http://[::ffff:169.254.169.254]")).toThrow(
      expect.objectContaining({ code: "VALIDATION_URL_INVALID" }),
    );
  });
});
