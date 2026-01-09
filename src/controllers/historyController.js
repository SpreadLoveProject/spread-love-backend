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

const getHistoryById = async (_req, _res, _next) => {};

export { getHistories, getHistoryById };
