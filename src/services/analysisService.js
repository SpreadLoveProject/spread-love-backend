import env from "../config/env.js";
import { openai } from "../config/openai.js";
import { ANALYSIS_SYSTEM_PROMPT } from "../constants/analysisPrompts.js";
import { urlToDataUrl } from "../utils/imageUtils.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { saveHistory } from "./historyService.js";

const analyze = async ({ imageUrl, pageUrl, userId }) => {
  const imageDataUrl = await urlToDataUrl(imageUrl);
  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
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

  const historyId = await saveHistory({
    userId,
    url: pageUrl,
    title: parsedAnalysis.title,
    summary: parsedAnalysis.summary,
    contentType: "analysis",
  });

  return {
    title: parsedAnalysis.title,
    summary: parsedAnalysis.summary,
    historyId,
  };
};

export { analyze };
