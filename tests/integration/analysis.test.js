import "./setup.js";

import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app.js";
import { openai } from "../../src/config/openai.js";
import { redis } from "../../src/config/redis.js";
import { supabase } from "../../src/config/supabase.js";
import { urlToDataUrl } from "../../src/utils/imageUtils.js";
import { createGuestToken, createUserToken } from "./tokenHelpers.js";

describe("POST /analyses", () => {
  beforeEach(() => {
    redis.incr.mockResolvedValue(1);
    redis.expire.mockResolvedValue(1);
  });

  it("토큰 없이 요청 시 401에러를 반환한다", async () => {
    const res = await request(app)
      .post("/analyses")
      .send({ imageUrl: "https://example.com/image.jpg" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_TOKEN_REQUIRED");
  });

  it("imageUrl 누락 시 400에러를 반환한다", async () => {
    const res = await request(app)
      .post("/analyses")
      .set("Authorization", createGuestToken())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_IMAGE_URL_REQUIRED");
  });

  it("잘못된 URL 형식 시 400에러를 반환한다", async () => {
    const res = await request(app)
      .post("/analyses")
      .set("Authorization", createGuestToken())
      .send({ imageUrl: "invalid-url" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_URL_INVALID");
  });

  it("게스트 토큰으로 정상 요청 시 분석 결과만을 반환한다", async () => {
    urlToDataUrl.mockResolvedValue("data:image/png;base64,mock");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const res = await request(app)
      .post("/analyses")
      .set("Authorization", createGuestToken())
      .send({ imageUrl: "https://example.com/image.jpg" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        title: "Test",
        summary: "Summary",
      },
    });
    expect(res.body.data.historyId).toBeUndefined();
  });

  it("회원 토큰으로 정상 요청 시 분석 결과와 historyId를 반환한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: "history-1" },
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    supabase.from.mockReturnValue({ insert: mockInsert });

    urlToDataUrl.mockResolvedValue("data:image/png;base64,mock");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const res = await request(app)
      .post("/analyses")
      .set("Authorization", createUserToken())
      .send({ imageUrl: "https://example.com/image.jpg" });

    expect(res.status).toBe(200);
    expect(res.body.data.historyId).toBe("history-1");
  });

  it("Rate limit 초과 시 429에러를 반환한다", async () => {
    redis.incr
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);

    urlToDataUrl.mockResolvedValue("data:image/png;base64,mock");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const token = createGuestToken();

    for (let i = 0; i < 3; i++) {
      await request(app)
        .post("/analyses")
        .set("Authorization", token)
        .send({ imageUrl: "https://example.com/image.jpg" });
    }

    const res = await request(app)
      .post("/analyses")
      .set("Authorization", token)
      .send({ imageUrl: "https://example.com/image.jpg" });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("분석 서비스 레이어 예외 발생 시 500 에러를 반환한다", async () => {
    urlToDataUrl.mockResolvedValue("data:image/png;base64,mock");
    openai.chat.completions.create.mockRejectedValue(new Error("OpenAI API 에러"));

    const res = await request(app)
      .post("/analyses")
      .set("Authorization", createGuestToken())
      .send({ imageUrl: "https://example.com/image.jpg" });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("SYSTEM_INTERNAL_ERROR");
  });

  it("settings 미제공 시 DEFAULT_SETTINGS를 사용한다", async () => {
    urlToDataUrl.mockResolvedValue("data:image/png;base64,mock");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    await request(app)
      .post("/analyses")
      .set("Authorization", createGuestToken())
      .send({ imageUrl: "https://example.com/image.jpg" });

    const callArgs = openai.chat.completions.create.mock.calls[0][0];
    const systemPrompt = callArgs.messages[0].content;

    expect(systemPrompt).toContain("5문장으로 요약하세요");
    expect(systemPrompt).toContain("명확하고 중립적인 말투로 설명하세요");
  });
});
