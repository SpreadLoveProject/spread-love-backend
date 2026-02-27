import env from "../config/env.js";
import logger from "../config/logger.js";
import { openai } from "../config/openai.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";
import { getSummaryPrompt } from "../utils/promptUtils.js";
import { captureFullPage, capturePageWithText } from "../utils/puppeteerUtils.js";
import { isArticleUrl } from "../utils/urlUtils.js";
import { saveHistory } from "./historyService.js";

const summarize = async ({ url, userId, settings }) => {
  const {
    imageDataUrl,
    pageTitle,
    pageText = null,
  } = await (isArticleUrl(url) ? capturePageWithText(url) : captureFullPage(url));

  const systemPrompt = getSummaryPrompt(settings, pageText, pageTitle);

  const userContent = [{ type: "image_url", image_url: { url: imageDataUrl } }];
  if (pageText) {
    userContent.push({ type: "text", text: `[페이지 본문 텍스트]\n${pageText}` });
  }

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
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
    logger.error(error.message);
  }

  return {
    title: parsedSummary.title,
    summary: parsedSummary.summary,
    historyId,
  };
};

export { summarize };
