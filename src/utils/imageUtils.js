import { UPLOAD } from "../constants/common.js";
import { ERROR_MESSAGE } from "../constants/errorCodes.js";

const fileToDataUrl = (file) => {
  const base64 = file.buffer.toString("base64");

  return `data:${file.mimetype};base64,${base64}`;
};

const urlToDataUrl = async (imageUrl) => {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`${ERROR_MESSAGE.IMAGE_FETCH_FAILED}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();

  if (buffer.byteLength > UPLOAD.MAX_FILE_SIZE) {
    throw new Error(ERROR_MESSAGE.FILE_SIZE_EXCEEDED);
  }

  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = response.headers.get("content-type") || "image/png";

  return `data:${contentType};base64,${base64}`;
};

export { fileToDataUrl, urlToDataUrl };
