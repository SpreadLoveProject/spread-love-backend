import { SUCCESS_MESSAGE } from "../constants/common.js";
import * as historyService from "../services/historyService.js";

const getHistories = async (req, res, next) => {
  try {
    const userId = req.userId;
    const histories = await historyService.getHistories(userId);

    res.json({
      success: true,
      data: { histories },
    });
  } catch (error) {
    next(error);
  }
};

const getHistoryById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id: historyId } = req.params;

    const history = await historyService.getHistoryById(userId, historyId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id: historyId } = req.params;

    await historyService.deleteHistory(userId, historyId);

    res.json({
      success: true,
      message: SUCCESS_MESSAGE.HISTORY_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

export { deleteHistory, getHistories, getHistoryById };
