import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { AppError } from "../errors/AppError.js";
import { analyze } from "../services/analysisService.js";

const createAnalysis = async (req, res) => {
  const { imageUrl, pageUrl, settings } = req.body;
  const userId = req.userId;

  if (!imageUrl) {
    throw new AppError("VALIDATION_IMAGE_URL_REQUIRED");
  }

  const userSettings = settings || DEFAULT_SETTINGS;

  const analysisResult = await analyze({ imageUrl, pageUrl, userId, settings: userSettings });

  res.json({
    success: true,
    data: analysisResult,
  });
};

export { createAnalysis };
