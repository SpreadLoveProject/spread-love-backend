import "./setup.js";

import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import app from "../../src/app.js";
import { supabase } from "../../src/config/supabase.js";
import { createGuestToken, createUserToken } from "./tokenHelpers.js";

describe("GET /histories", () => {
  it("토큰 없이 요청 시 401에러를 반환한다", async () => {
    const res = await request(app).get("/histories");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_TOKEN_REQUIRED");
  });

  it("게스트 토큰으로 요청 시 401에러를 반환한다", async () => {
    const res = await request(app).get("/histories").set("Authorization", createGuestToken());

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_LOGIN_REQUIRED");
  });

  it("회원 토큰으로 히스토리 목록을 조회한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockHistories = [
      {
        id: "h1",
        content_type: "analysis",
        url: "https://example.com/1",
        contents: { title: "Title 1", summary: "Summary 1" },
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "h2",
        content_type: "summary",
        url: "https://example.com/2",
        contents: { title: "Title 2", summary: "Summary 2" },
        created_at: "2024-01-02T00:00:00Z",
      },
    ];

    const mockCountEq = vi.fn().mockResolvedValue({ count: 2, error: null });
    const mockCountSelect = vi.fn().mockReturnValue({ eq: mockCountEq });

    const mockRange = vi.fn().mockResolvedValue({ data: mockHistories, error: null });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockDataEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockDataSelect = vi.fn().mockReturnValue({ eq: mockDataEq });

    supabase.from.mockImplementation((table) => {
      if (table === "histories") {
        return {
          select: (fields, options) => {
            if (options?.count === "exact") {
              return mockCountSelect(fields, options);
            }
            return mockDataSelect(fields);
          },
        };
      }
    });

    const res = await request(app).get("/histories").set("Authorization", createUserToken());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        histories: [
          {
            id: "h1",
            contentType: "analysis",
            url: "https://example.com/1",
            contents: { title: "Title 1", summary: "Summary 1" },
            createdAt: "2024-01-01T00:00:00Z",
          },
          {
            id: "h2",
            contentType: "summary",
            url: "https://example.com/2",
            contents: { title: "Title 2", summary: "Summary 2" },
            createdAt: "2024-01-02T00:00:00Z",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 2,
          limit: 11,
        },
      },
    });
  });

  it("페이지네이션 파라미터(page, limit)를 올바르게 처리한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockCountEq = vi.fn().mockResolvedValue({ count: 25, error: null });
    const mockCountSelect = vi.fn().mockReturnValue({ eq: mockCountEq });

    const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockDataEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockDataSelect = vi.fn().mockReturnValue({ eq: mockDataEq });

    supabase.from.mockImplementation((table) => {
      if (table === "histories") {
        return {
          select: (fields, options) => {
            if (options?.count === "exact") {
              return mockCountSelect(fields, options);
            }
            return mockDataSelect(fields);
          },
        };
      }
    });

    const res = await request(app)
      .get("/histories?page=2&limit=10")
      .set("Authorization", createUserToken());

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toMatchObject({
      currentPage: 2,
      totalPages: 3,
      totalCount: 25,
      limit: 10,
    });
  });

  it("히스토리가 없을 때 빈 배열을 반환한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockCountEq = vi.fn().mockResolvedValue({ count: 0, error: null });
    const mockCountSelect = vi.fn().mockReturnValue({ eq: mockCountEq });

    const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockDataEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockDataSelect = vi.fn().mockReturnValue({ eq: mockDataEq });

    supabase.from.mockImplementation((table) => {
      if (table === "histories") {
        return {
          select: (fields, options) => {
            if (options?.count === "exact") {
              return mockCountSelect(fields, options);
            }
            return mockDataSelect(fields);
          },
        };
      }
    });

    const res = await request(app).get("/histories").set("Authorization", createUserToken());

    expect(res.status).toBe(200);
    expect(res.body.data.histories).toEqual([]);
    expect(res.body.data.pagination.totalCount).toBe(0);
  });
});

describe("DELETE /histories/:id", () => {
  it("토큰 없이 요청 시 401에러를 반환한다", async () => {
    const res = await request(app).delete("/histories/test-id");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_TOKEN_REQUIRED");
  });

  it("게스트 토큰으로 요청 시 401에러를 반환한다", async () => {
    const res = await request(app)
      .delete("/histories/test-id")
      .set("Authorization", createGuestToken());

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_LOGIN_REQUIRED");
  });

  it("히스토리를 삭제한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockSelect = vi.fn().mockResolvedValue({
      data: [{ id: "history-1" }],
      error: null,
    });
    const mockEq2 = vi.fn().mockReturnValue({ select: mockSelect });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
    supabase.from.mockReturnValue({ delete: mockDelete });

    const res = await request(app)
      .delete("/histories/history-1")
      .set("Authorization", createUserToken());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: "히스토리가 삭제되었습니다.",
    });
  });

  it("존재하지 않는 히스토리 삭제 시 404에러를 반환한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockSelect = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const mockEq2 = vi.fn().mockReturnValue({ select: mockSelect });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
    supabase.from.mockReturnValue({ delete: mockDelete });

    const res = await request(app)
      .delete("/histories/nonexistent-id")
      .set("Authorization", createUserToken());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("RESOURCE_HISTORY_NOT_FOUND");
  });

  it("다른 사용자의 히스토리 삭제 시 404에러를 반환한다", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockSelect = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const mockEq2 = vi.fn().mockReturnValue({ select: mockSelect });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
    supabase.from.mockReturnValue({ delete: mockDelete });

    const res = await request(app)
      .delete("/histories/other-user-history")
      .set("Authorization", createUserToken());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("RESOURCE_HISTORY_NOT_FOUND");
  });
});
