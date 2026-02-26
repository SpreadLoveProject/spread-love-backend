import { describe, expect, it } from "vitest";

import { LENGTH_INSTRUCTIONS, PERSONA_INSTRUCTIONS } from "../constants/promptConfig.js";
import { getAnalysisPrompt, getSummaryPrompt } from "./promptUtils.js";

describe("promptUtils", () => {
  describe("getSummaryPrompt", () => {
    it("length와 persona 설정에 따른 프롬프트를 생성한다", () => {
      const prompt = getSummaryPrompt({ length: "short", persona: "friendly" });

      expect(prompt).toContain(LENGTH_INSTRUCTIONS.short);
      expect(prompt).toContain(PERSONA_INSTRUCTIONS.friendly);
    });

    it("JSON 출력 형식을 포함한다", () => {
      const prompt = getSummaryPrompt({ length: "medium", persona: "default" });

      expect(prompt).toContain('"title"');
      expect(prompt).toContain('"summary"');
    });

    it("pageText가 있으면 본문 텍스트 기반 지시를 포함한다", () => {
      const prompt = getSummaryPrompt({ length: "short", persona: "default" }, "기사 본문");

      expect(prompt).toContain("제공된 본문 텍스트를 기반으로");
      expect(prompt).toContain(LENGTH_INSTRUCTIONS.short);
    });

    it("pageText가 없으면 스크린샷 기반 지시를 포함한다", () => {
      const prompt = getSummaryPrompt({ length: "short", persona: "default" });

      expect(prompt).toContain("스크린샷에서 실제로 보이는 텍스트와 요소만을 근거로");
    });
  });

  describe("getAnalysisPrompt", () => {
    it("length와 persona 설정에 따른 프롬프트를 생성한다", () => {
      const prompt = getAnalysisPrompt({ length: "long", persona: "professional" });

      expect(prompt).toContain(LENGTH_INSTRUCTIONS.long);
      expect(prompt).toContain(PERSONA_INSTRUCTIONS.professional);
    });

    it("JSON 출력 형식을 포함한다", () => {
      const prompt = getAnalysisPrompt({ length: "medium", persona: "default" });

      expect(prompt).toContain('"title"');
      expect(prompt).toContain('"summary"');
    });
  });
});
