import { SUMMARY_SYSTEM_PROMPT } from "../constants/summaryPrompts.js";
import { fileToDataUrl } from "../utils/imageUtils.js";

const summarize = async ({ file, url }) => {
  const imageDataUrl = fileToDataUrl(file);
  return { imageDataUrl, url, systemPrompt: SUMMARY_SYSTEM_PROMPT };
};

export { summarize };
