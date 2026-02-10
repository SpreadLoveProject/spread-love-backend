import { DEFAULT_SETTINGS } from "../constants/promptConfig.js";
import { AppError } from "../errors/AppError.js";
import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res) => {
  const { url, settings } = req.body;
  const userId = req.userId;

  if (!url) {
    throw new AppError("VALIDATION_URL_REQUIRED");
  }

  const userSettings = settings || DEFAULT_SETTINGS;

  const summaryResult = await summarize({ url, userId, settings: userSettings });

  res.json({
    success: true,
    data: summaryResult,
  });
};

export { createSummary };
