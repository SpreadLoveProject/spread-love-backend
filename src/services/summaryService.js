import env from "../config/env.js";
import { openai } from "../config/openai.js";
import { SUMMARY_SYSTEM_PROMPT } from "../constants/summaryPrompts.js";
import { fileToDataUrl } from "../utils/imageUtils.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { saveHistory } from "./historyService.js";

const summarize = async ({ file, url, userId }) => {
  const imageDataUrl = fileToDataUrl(file);

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      {
        role: "user",
        content: [{ type: "image_url", image_url: { url: imageDataUrl } }],
      },
    ],
  });

  const parsedSummary = parseJsonResponse(response.choices[0].message.content);

  if (!userId) {
    return {
      title: parsedSummary.title,
      summary: parsedSummary.summary,
    };
  }

  const historyId = await saveHistory({
    userId,
    url,
    title: parsedSummary.title,
    summary: parsedSummary.summary,
    contentType: "summary",
  });

  return {
    title: parsedSummary.title,
    summary: parsedSummary.summary,
    historyId,
  };
};

export { summarize };
