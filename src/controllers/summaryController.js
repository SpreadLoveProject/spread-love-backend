import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res, next) => {
  try {
    const file = req.file;
    const { url } = req.body;
    const userId = req.userId;

    if (!file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.IMAGE_REQUIRED,
      });
    }

    const summaryResult = await summarize({ file, url, userId });

    res.json({
      success: true,
      data: summaryResult,
    });
  } catch (error) {
    next(error);
  }
};

export { createSummary };
