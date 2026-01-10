import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { analyze } from "../services/analysisService.js";

const createAnalysis = async (req, res, next) => {
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

    const analysisResult = await analyze({ file, url, userId });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

export { createAnalysis };
