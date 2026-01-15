import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { analyze } from "../services/analysisService.js";

const createAnalysis = async (req, res, next) => {
  try {
    const { imageUrl, pageUrl, settings } = req.body;
    const userId = req.userId;

    if (!imageUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.IMAGE_URL_REQUIRED,
      });
    }

    const userSettings = settings || DEFAULT_SETTINGS;

    const analysisResult = await analyze({ imageUrl, pageUrl, userId, settings: userSettings });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

export { createAnalysis };
