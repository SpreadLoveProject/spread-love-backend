import { fileToDataUrl } from "../utils/imageUtils.js";

const summarize = async ({ file, url }) => {
  const imageDataUrl = fileToDataUrl(file);
  return { imageDataUrl, url };
};

export { summarize };
