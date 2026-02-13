import { PAGINATION, SUCCESS_MESSAGE } from "../constants/common.js";
import { AppError } from "../errors/AppError.js";
import * as historyService from "../services/historyService.js";

const getHistories = async (req, res) => {
  const userId = req.userId;
  const page = Number(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT;

  const { histories, pagination } = await historyService.getHistories(userId, page, limit);

  res.json({
    success: true,
    data: { histories, pagination },
  });
};

const deleteHistory = async (req, res) => {
  const userId = req.userId;
  const { id: historyId } = req.params;

  if (!historyId) {
    throw new AppError("VALIDATION_HISTORY_ID_REQUIRED");
  }

  await historyService.deleteHistory(userId, historyId);

  res.json({
    success: true,
    message: SUCCESS_MESSAGE.HISTORY_DELETED,
  });
};

export { deleteHistory, getHistories };
