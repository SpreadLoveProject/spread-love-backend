import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res, _next) => {
  const file = req.file;
  const { url } = req.body;
  const userId = req.userId;

  const result = await summarize({ file, url, userId });

  res.json({
    success: true,
    data: result,
  });
};

export { createSummary };
