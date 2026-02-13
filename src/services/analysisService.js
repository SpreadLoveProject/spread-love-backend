import env from "../config/env.js";
import logger from "../config/logger.js";
import { openai } from "../config/openai.js";
import { urlToDataUrl } from "../utils/imageUtils.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { getAnalysisPrompt } from "../utils/promptUtils.js";
import { saveHistory } from "./historyService.js";

const analyze = async ({ imageUrl, pageUrl, userId, settings }) => {
  const imageDataUrl = await urlToDataUrl(imageUrl);
  const systemPrompt = getAnalysisPrompt(settings);

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [{ type: "image_url", image_url: { url: imageDataUrl } }],
      },
    ],
  });

  const parsedAnalysis = parseJsonResponse(response.choices[0].message.content);

  if (!userId) {
    return {
      title: parsedAnalysis.title,
      summary: parsedAnalysis.summary,
    };
  }

  let historyId = null;
  try {
    historyId = await saveHistory({
      userId,
      url: pageUrl,
      title: parsedAnalysis.title,
      summary: parsedAnalysis.summary,
      contentType: "analysis",
    });
  } catch (error) {
    logger.error(error.message);
  }

  return {
    title: parsedAnalysis.title,
    summary: parsedAnalysis.summary,
    historyId,
  };
};

export { analyze };
