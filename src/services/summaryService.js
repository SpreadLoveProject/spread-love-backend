import { openai } from "../config/openai.js";
import { SUMMARY_SYSTEM_PROMPT } from "../constants/summaryPrompts.js";
import { fileToDataUrl } from "../utils/imageUtils.js";

const summarize = async ({ file, _url }) => {
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

  const result = JSON.parse(response.choices[0].message.content);

  return {
    title: result.title,
    summary: result.summary,
    historyId: null,
  };
};

export { summarize };
