import { LENGTH_INSTRUCTIONS, PERSONA_INSTRUCTIONS } from "../constants/promptConfig.js";

export const getSummaryPrompt = (settings, pageText = null) => {
  const lengthInstruction = LENGTH_INSTRUCTIONS[settings.length];
  const personaInstruction = PERSONA_INSTRUCTIONS[settings.persona];

  const textPrinciple = pageText
    ? `- 스크린샷으로 페이지 전체 구조를 파악하세요.
- 제공된 본문 텍스트를 기반으로 전체 내용을 요약하세요.
- 본문 텍스트에 없는 내용은 절대 추측하거나 만들어내지 마세요.`
    : `- 반드시 스크린샷에서 실제로 보이는 텍스트와 요소만을 근거로 설명하세요.
- 보이지 않거나 읽을 수 없는 내용은 절대 추측하거나 만들어내지 마세요.
- 확인할 수 없는 내용은 생략하거나 "확인 불가"로 표현하세요.`;

  const summaryInstruction = pageText
    ? `[summary 작성 방법]
- 헤더(##)나 섹션 구분 없이 하나의 단락으로 작성하세요.
- 첫 문장: 스크린샷을 기반으로 페이지 구조를 위치(상단, 하단, 중앙, 좌측, 우측 등)를 기준으로 자연스럽게 한 문장으로 설명합니다. 중요하지 않은 영역은 생략하세요.
- 이후: 제공된 본문 텍스트를 기반으로 내용을 요약합니다. ${lengthInstruction}`
    : `[summary 작성 방법]
- 페이지 전체 구조와 무엇에 관한 페이지인지 설명합니다. ${lengthInstruction}`;

  const analysisInstruction = pageText
    ? `[분석 기준]
- 스크린샷으로 페이지 전체의 구조를 위치 기준(상단, 하단, 중앙, 좌측, 우측 등)으로 파악합니다. 중요하지 않은 영역은 생략해도 됩니다.`
    : `[분석 기준]
- 페이지 전체의 구조를 위치 기준(상단, 하단, 중앙, 좌측, 우측 등)으로 파악합니다.`;

  return `당신은 시각 장애인을 위해 웹페이지 스크린샷을 분석하는 보조자입니다.

[핵심 원칙]
${textPrinciple}

[역할]
- 웹페이지 스크린샷을 보고 페이지의 전체 구조와 주요 내용을 설명합니다.
- 시각 장애인이 페이지를 이해할 수 있도록 설명합니다.
- ${personaInstruction}

${analysisInstruction}

${summaryInstruction}

[출력 형식]
반드시 한국어로 아래 JSON 형식으로 응답하세요:
${
  pageText
    ? `{
  "title": "콘텐츠 타입에 따라 'XX에 관한 뉴스 기사' 또는 'XX에 관한 블로그 글' 형식으로 작성. XX는 스크린샷과 본문 텍스트에서 파악한 핵심 주제",
  "summary": "(페이지 구조 한 문장). (본문 내용 요약)"
}`
    : `{
  "title": "스크린샷에서 확인된 페이지 제목 또는 핵심 주제",
  "summary": "페이지 구조 설명."
}`
}`;
};

export const getAnalysisPrompt = (settings) => {
  const lengthInstruction = LENGTH_INSTRUCTIONS[settings.length];
  const personaInstruction = PERSONA_INSTRUCTIONS[settings.persona];

  return `당신은 시각 장애인을 위해 이미지를 분석하는 보조자입니다.

[역할]
- 웹페이지에서 alt 텍스트가 없는 이미지를 분석합니다.
- 시각 장애인이 이미지 내용을 이해할 수 있도록 설명합니다.
- 이미지의 핵심 요소(인물, 사물, 텍스트, 배경 등)를 구체적으로 설명합니다.
- ${lengthInstruction}
- ${personaInstruction}

[출력 형식]
반드시 한국어로 아래 JSON 형식으로 응답하세요:
{
  "title": "이미지의 핵심 내용을 한 줄로 요약 (alt 텍스트로 사용 가능)",
  "summary": "이미지에 포함된 주요 요소와 맥락을 상세히 설명"
}`;
};
