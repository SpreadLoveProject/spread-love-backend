import { describe, expect, it } from "vitest";

import { parseJsonResponse } from "./jsonUtils.js";

describe("jsonUtils", () => {
  describe("parseJsonResponse", () => {
    it("유효한 JSON 문자열을 파싱한다", () => {
      const input = '{"title": "테스트", "summary": "내용"}';
      const result = parseJsonResponse(input);

      expect(result).toEqual({ title: "테스트", summary: "내용" });
    });

    it("```json 코드블록을 제거하고 파싱한다", () => {
      const input = '```json\n{"title": "테스트", "summary": "내용"}\n```';
      const result = parseJsonResponse(input);

      expect(result).toEqual({ title: "테스트", summary: "내용" });
    });

    it("``` 코드블록을 제거하고 파싱한다", () => {
      const input = '```\n{"title": "테스트", "summary": "내용"}\n```';
      const result = parseJsonResponse(input);

      expect(result).toEqual({ title: "테스트", summary: "내용" });
    });

    it("유효하지 않은 JSON은 PARSE_JSON_FAILED 에러를 던진다", () => {
      expect(() => parseJsonResponse("not a json")).toThrow(
        expect.objectContaining({ code: "PARSE_JSON_FAILED" }),
      );
    });

    it("빈 문자열은 PARSE_JSON_FAILED 에러를 던진다", () => {
      expect(() => parseJsonResponse("")).toThrow(
        expect.objectContaining({ code: "PARSE_JSON_FAILED" }),
      );
    });

    it("앞뒤 공백이 있어도 정상 파싱한다", () => {
      const input = '  {"title": "테스트"}  ';
      const result = parseJsonResponse(input);

      expect(result).toEqual({ title: "테스트" });
    });
  });
});
