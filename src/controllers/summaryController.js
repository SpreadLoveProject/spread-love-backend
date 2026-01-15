import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res, next) => {
  try {
    const file = req.file;
    const { url, settings: settingsString } = req.body;
    const userId = req.userId;

    if (!file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.IMAGE_REQUIRED,
      });
    }

    const settings = settingsString ? JSON.parse(settingsString) : DEFAULT_SETTINGS;

    const summaryResult = await summarize({ file, url, userId, settings });

    res.json({
      success: true,
      data: summaryResult,
    });
  } catch (error) {
    next(error);
  }
};

export { createSummary };
