import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res, next) => {
  try {
    const file = req.file;
    const { url } = req.body;
    const userId = req.userId;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "이미지 파일이 필요합니다.",
      });
    }

    const result = await summarize({ file, url, userId });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { createSummary };
