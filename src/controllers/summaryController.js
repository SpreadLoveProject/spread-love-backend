import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res, next) => {
  try {
    const { url, settings } = req.body;
    const userId = req.userId;

    if (!url) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.URL_REQUIRED,
      });
    }

    const userSettings = settings || DEFAULT_SETTINGS;

    const summaryResult = await summarize({ url, userId, settings: userSettings });

    res.json({
      success: true,
      data: summaryResult,
    });
  } catch (error) {
    next(error);
  }
};

export { createSummary };
