import { beforeEach, describe, expect, it, vi } from "vitest";

import { PAGINATION, SUCCESS_MESSAGE } from "../constants/common.js";
import * as historyService from "../services/historyService.js";
import { deleteHistory, getHistories } from "./historyController.js";

vi.mock("../services/historyService.js", () => ({
  getHistories: vi.fn(),
  deleteHistory: vi.fn(),
}));

describe("historyController", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      userId: "user-123",
      query: {},
      params: {},
    };
    mockRes = {
      json: vi.fn(),
    };
  });

  describe("getHistories", () => {
    it("기본 페이지네이션으로 히스토리를 조회한다", async () => {
      historyService.getHistories.mockResolvedValue({
        histories: [{ id: "1" }],
        pagination: { page: 1, limit: 11, hasMore: false },
      });

      await getHistories(mockReq, mockRes);

      expect(historyService.getHistories).toHaveBeenCalledWith(
        "user-123",
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          histories: [{ id: "1" }],
          pagination: { page: 1, limit: 11, hasMore: false },
        },
      });
    });

    it("쿼리 파라미터로 페이지네이션을 지정할 수 있다", async () => {
      mockReq.query = { page: "2", limit: "5" };
      historyService.getHistories.mockResolvedValue({
        histories: [],
        pagination: { page: 2, limit: 5, hasMore: false },
      });

      await getHistories(mockReq, mockRes);

      expect(historyService.getHistories).toHaveBeenCalledWith("user-123", 2, 5);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          histories: [],
          pagination: { page: 2, limit: 5, hasMore: false },
        },
      });
    });

    it("page/limit이 '0'이면 기본값을 사용한다", async () => {
      mockReq.query = { page: "0", limit: "0" };
      historyService.getHistories.mockResolvedValue({
        histories: [],
        pagination: { page: 1, limit: 11, hasMore: false },
      });

      await getHistories(mockReq, mockRes);

      expect(historyService.getHistories).toHaveBeenCalledWith(
        "user-123",
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
    });

    it("page/limit이 숫자가 아니면 기본값을 사용한다", async () => {
      mockReq.query = { page: "abc", limit: "xyz" };
      historyService.getHistories.mockResolvedValue({
        histories: [],
        pagination: { page: 1, limit: 11, hasMore: false },
      });

      await getHistories(mockReq, mockRes);

      expect(historyService.getHistories).toHaveBeenCalledWith(
        "user-123",
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
    });

    it("서비스가 실패하면 에러가 전파된다", async () => {
      historyService.getHistories.mockRejectedValue(new Error("DB 에러"));

      await expect(getHistories(mockReq, mockRes)).rejects.toThrow("DB 에러");
    });
  });

  describe("deleteHistory", () => {
    it("historyId가 없으면 VALIDATION_HISTORY_ID_REQUIRED 에러를 던진다", async () => {
      mockReq.params = {};

      await expect(deleteHistory(mockReq, mockRes)).rejects.toThrow(
        expect.objectContaining({ code: "VALIDATION_HISTORY_ID_REQUIRED" }),
      );
    });

    it("성공 시 삭제 완료 메시지를 응답한다", async () => {
      mockReq.params = { id: "history-1" };
      historyService.deleteHistory.mockResolvedValue();

      await deleteHistory(mockReq, mockRes);

      expect(historyService.deleteHistory).toHaveBeenCalledWith("user-123", "history-1");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: SUCCESS_MESSAGE.HISTORY_DELETED,
      });
    });

    it("서비스가 실패하면 에러가 전파된다", async () => {
      mockReq.params = { id: "history-1" };
      historyService.deleteHistory.mockRejectedValue(new Error("삭제 실패"));

      await expect(deleteHistory(mockReq, mockRes)).rejects.toThrow("삭제 실패");
    });
  });
});
