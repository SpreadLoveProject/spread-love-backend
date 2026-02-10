import sharp from "sharp";

import { UPLOAD } from "../constants/common.js";
import { AppError } from "../errors/AppError.js";

const urlToDataUrl = async (imageUrl) => {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new AppError("IMAGE_FETCH_FAILED");
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > UPLOAD.MAX_FILE_SIZE) {
    throw new AppError("VALIDATION_FILE_SIZE_EXCEEDED");
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.startsWith("image/")) {
    throw new AppError("VALIDATION_IMAGE_TYPE_INVALID");
  }

  const isSvg = imageUrl.endsWith(".svg") || contentType.includes("svg");
  const rawBuffer = await response.arrayBuffer();

  if (rawBuffer.byteLength > UPLOAD.MAX_FILE_SIZE) {
    throw new AppError("VALIDATION_FILE_SIZE_EXCEEDED");
  }

  if (isSvg) {
    const pngBuffer = await sharp(Buffer.from(rawBuffer)).png().toBuffer();
    const base64 = pngBuffer.toString("base64");

    return `data:image/png;base64,${base64}`;
  }

  const base64 = Buffer.from(rawBuffer).toString("base64");

  return `data:${contentType || "image/png"};base64,${base64}`;
};

export { urlToDataUrl };
