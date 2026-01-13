import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";
import { analyze } from "../services/analysisService.js";

const createAnalysis = async (req, res, next) => {
  try {
    const { imageUrl, pageUrl } = req.body;
    const userId = req.userId;

    if (!imageUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.IMAGE_URL_REQUIRED,
      });
    }

    const analysisResult = await analyze({ imageUrl, pageUrl, userId });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

export { createAnalysis };
