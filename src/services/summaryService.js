import { openai } from "../config/openai.js";
import { SUMMARY_SYSTEM_PROMPT } from "../constants/summaryPrompts.js";
import { fileToDataUrl } from "../utils/imageUtils.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { saveHistory } from "./historyService.js";

const summarize = async ({ file, url, userId }) => {
  const imageDataUrl = fileToDataUrl(file);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      {
        role: "user",
        content: [{ type: "image_url", image_url: { url: imageDataUrl } }],
      },
    ],
  });

  const result = parseJsonResponse(response.choices[0].message.content);

  let historyId = null;
  if (userId) {
    historyId = await saveHistory({
      userId,
      url,
      title: result.title,
      summary: result.summary,
    });
  }

  return {
    title: result.title,
    summary: result.summary,
    historyId,
  };
};

export { summarize };
