import "./setup.js";

import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app.js";
import { openai } from "../../src/config/openai.js";
import { redis } from "../../src/config/redis.js";
import { supabase } from "../../src/config/supabase.js";
import { captureFullPage } from "../../src/utils/puppeteerUtils.js";
import { createGuestToken, createUserToken } from "./tokenHelpers.js";

describe("POST /summaries", () => {
  beforeEach(() => {
    redis.incr.mockResolvedValue(1);
    redis.expire.mockResolvedValue(1);
  });

  it("토큰 없이 요청 시 401에러를 반환한다", async () => {
    const res = await request(app).post("/summaries").send({ url: "https://example.com" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_TOKEN_REQUIRED");
  });

  it("URL이 없으면 400에러를 반환한다", async () => {
    const res = await request(app)
      .post("/summaries")
      .set("Authorization", createGuestToken())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_URL_REQUIRED");
  });

  it("잘못된 URL 형식이면 400에러를 반환한다", async () => {
    const res = await request(app)
      .post("/summaries")
      .set("Authorization", createGuestToken())
      .send({ url: "invalid-url" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_URL_INVALID");
  });

  it("게스트 토큰으로 정상 요청 시 요약 결과만을 반환한다", async () => {
    captureFullPage.mockResolvedValue("data:image/png;base64,mock-screenshot");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const res = await request(app)
      .post("/summaries")
      .set("Authorization", createGuestToken())
      .send({ url: "https://example.com" });

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

  it("회원 토큰으로 정상 요청 시 요약 결과와 historyId를 반환한다", async () => {
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

    captureFullPage.mockResolvedValue("data:image/png;base64,mock-screenshot");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const res = await request(app)
      .post("/summaries")
      .set("Authorization", createUserToken())
      .send({ url: "https://example.com" });

    expect(res.status).toBe(200);
    expect(res.body.data.historyId).toBe("history-1");
  });

  it("요청 제한을 초과하면 429에러를 반환한다", async () => {
    redis.incr
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);

    captureFullPage.mockResolvedValue("data:image/png;base64,mock-screenshot");
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const token = createGuestToken();

    for (let i = 0; i < 3; i++) {
      await request(app)
        .post("/summaries")
        .set("Authorization", token)
        .send({ url: "https://example.com" });
    }

    const res = await request(app)
      .post("/summaries")
      .set("Authorization", token)
      .send({ url: "https://example.com" });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("동시 요청 제한을 초과하면 429에러를 반환한다", async () => {
    captureFullPage.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve("data:image/png;base64,mock-screenshot"), 100),
        ),
    );
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: "Test", summary: "Summary" }) } }],
    });

    const requests = Array(4)
      .fill(null)
      .map(() =>
        request(app)
          .post("/summaries")
          .set("Authorization", createGuestToken())
          .send({ url: "https://example.com" }),
      );

    const results = await Promise.all(requests);
    const statuses = results.map((r) => r.status);

    expect(statuses.filter((s) => s === 429).length).toBeGreaterThanOrEqual(1);
  });
});
