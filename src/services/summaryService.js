import env from "../config/env.js";
import { openai } from "../config/openai.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { getSummaryPrompt } from "../utils/promptUtils.js";
import { captureFullPage } from "../utils/puppeteerUtils.js";
import { saveHistory } from "./historyService.js";

const summarize = async ({ url, userId, settings }) => {
  const imageDataUrl = await captureFullPage(url);
  const systemPrompt = getSummaryPrompt(settings);

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

  const parsedSummary = parseJsonResponse(response.choices[0].message.content);

  if (!userId) {
    return {
      title: parsedSummary.title,
      summary: parsedSummary.summary,
    };
  }

  let historyId = null;
  try {
    historyId = await saveHistory({
      userId,
      url,
      title: parsedSummary.title,
      summary: parsedSummary.summary,
      contentType: "summary",
    });
  } catch (error) {
    console.error(error.message);
  }

  return {
    title: parsedSummary.title,
    summary: parsedSummary.summary,
    historyId,
  };
};

export { summarize };
