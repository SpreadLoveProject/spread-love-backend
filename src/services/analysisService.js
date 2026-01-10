import env from "../config/env.js";
import { openai } from "../config/openai.js";
import { ANALYSIS_SYSTEM_PROMPT } from "../constants/analysisPrompts.js";
import { fileToDataUrl } from "../utils/imageUtils.js";
import { parseJsonResponse } from "../utils/jsonUtils.js";

const analyze = async ({ file, _url, _userId }) => {
  const imageDataUrl = fileToDataUrl(file);
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

  return {
    title: parsedAnalysis.title,
    summary: parsedAnalysis.summary,
  };
};

export { analyze };
