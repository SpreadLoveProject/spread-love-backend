import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "../config/supabase.js";
import { PAGINATION } from "../constants/common.js";
import { SUPABASE_ERROR } from "../constants/errorCodes.js";
import { deleteHistory, getHistories, saveHistory } from "./historyService.js";

const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn(() => ({ select: mockSelect }));

vi.mock("../config/supabase.js", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("historyService", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockSingle.mockReset();
    mockInsert.mockReset().mockReturnValue({ select: mockSelect });
  });

  describe("saveHistory", () => {
    beforeEach(() => {
      mockSelect.mockReturnValue({ single: mockSingle });
      supabase.from.mockReturnValue({ insert: mockInsert });
    });

    it("히스토리를 저장하고 id를 반환한다", async () => {
      mockSingle.mockResolvedValue({ data: { id: "history-1" }, error: null });

      const result = await saveHistory({
        userId: "user-123",
        url: "https://example.com",
        title: "테스트",
        summary: "요약",
        contentType: "summary",
      });

      expect(supabase.from).toHaveBeenCalledWith("histories");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        content_type: "summary",
        url: "https://example.com",
        contents: { title: "테스트", summary: "요약" },
      });
      expect(result).toBe("history-1");
    });

    it("DB 에러 시 DB_ERROR를 던진다", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "insert failed" } });

      await expect(
        saveHistory({
          userId: "user-123",
          url: "https://example.com",
          title: "테스트",
          summary: "요약",
          contentType: "summary",
        }),
      ).rejects.toThrow(expect.objectContaining({ code: "DB_ERROR" }));
    });

    it("data가 없으면 null을 반환한다", async () => {
      mockSingle.mockResolvedValue({ data: null, error: null });

      const result = await saveHistory({
        userId: "user-123",
        url: "https://example.com",
        title: "테스트",
        summary: "요약",
        contentType: "summary",
      });

      expect(result).toBeNull();
    });
  });

  describe("getHistories", () => {
    const setupGetHistoriesMock = (countResult, dataResult) => {
      const mocks = [
        {
          select: vi.fn(() => ({
            eq: vi.fn(() => countResult),
          })),
        },
        {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => dataResult),
              })),
            })),
          })),
        },
      ];
      let callIndex = 0;
      supabase.from.mockImplementation(() => mocks[callIndex++]);
    };

    it("히스토리 목록과 페이지네이션을 반환한다", async () => {
      setupGetHistoriesMock(
        { count: 2, error: null },
        {
          data: [
            {
              id: "1",
              content_type: "summary",
              url: "https://a.com",
              contents: { title: "A" },
              created_at: "2025-01-01",
            },
            {
              id: "2",
              content_type: "analysis",
              url: "https://b.com",
              contents: { title: "B" },
              created_at: "2025-01-02",
            },
          ],
          error: null,
        },
      );

      const result = await getHistories("user-123", 1, 10);

      expect(result.histories).toHaveLength(2);
      expect(result.histories[0]).toEqual({
        id: "1",
        contentType: "summary",
        url: "https://a.com",
        contents: { title: "A" },
        createdAt: "2025-01-01",
      });
      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalCount: 2,
        limit: 10,
      });
    });

    it("page/limit을 전달하지 않으면 기본 페이지네이션 값을 사용한다", async () => {
      setupGetHistoriesMock({ count: 0, error: null }, { data: [], error: null });

      const result = await getHistories("user-123");

      expect(result.pagination).toEqual({
        currentPage: PAGINATION.DEFAULT_PAGE,
        totalPages: 0,
        totalCount: 0,
        limit: PAGINATION.DEFAULT_LIMIT,
      });
    });

    it("count 쿼리 에러 시 DB_ERROR를 던진다", async () => {
      setupGetHistoriesMock(
        { count: null, error: { message: "count failed" } },
        { data: [], error: null },
      );

      await expect(getHistories("user-123")).rejects.toThrow(
        expect.objectContaining({ code: "DB_ERROR" }),
      );
    });

    it("data 쿼리 에러 시 DB_ERROR를 던진다", async () => {
      setupGetHistoriesMock(
        { count: 5, error: null },
        { data: null, error: { message: "select failed" } },
      );

      await expect(getHistories("user-123")).rejects.toThrow(
        expect.objectContaining({ code: "DB_ERROR" }),
      );
    });
  });

  describe("deleteHistory", () => {
    const setupDeleteMock = (result) => {
      supabase.from.mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => result),
            })),
          })),
        })),
      });
    };

    it("히스토리를 삭제한다", async () => {
      setupDeleteMock({ data: [{ id: "history-1" }], error: null });

      await expect(deleteHistory("user-123", "history-1")).resolves.toBeUndefined();
    });

    it("잘못된 UUID 형식이면 VALIDATION_BAD_REQUEST를 던진다", async () => {
      setupDeleteMock({ data: null, error: { code: SUPABASE_ERROR.INVALID_UUID } });

      await expect(deleteHistory("user-123", "invalid-uuid")).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_BAD_REQUEST" }),
      );
    });

    it("DB 에러 시 DB_ERROR를 던진다", async () => {
      setupDeleteMock({ data: null, error: { code: "OTHER_ERROR", message: "delete failed" } });

      await expect(deleteHistory("user-123", "history-1")).rejects.toThrow(
        expect.objectContaining({ code: "DB_ERROR" }),
      );
    });

    it("삭제된 행이 빈 배열이면 RESOURCE_HISTORY_NOT_FOUND를 던진다", async () => {
      setupDeleteMock({ data: [], error: null });

      await expect(deleteHistory("user-123", "nonexistent")).rejects.toThrow(
        expect.objectContaining({ code: "RESOURCE_HISTORY_NOT_FOUND" }),
      );
    });

    it("삭제된 행이 null이면 RESOURCE_HISTORY_NOT_FOUND를 던진다", async () => {
      setupDeleteMock({ data: null, error: null });

      await expect(deleteHistory("user-123", "nonexistent")).rejects.toThrow(
        expect.objectContaining({ code: "RESOURCE_HISTORY_NOT_FOUND" }),
      );
    });
  });
});
