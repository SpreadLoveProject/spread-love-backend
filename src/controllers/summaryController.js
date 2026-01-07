import { summarize } from "../services/summaryService.js";

const createSummary = async (req, res, _next) => {
  const file = req.file;
  const { url } = req.body;

  const result = await summarize({ file, url });

  res.json({
    success: true,
    data: result,
  });
};

export { createSummary };
