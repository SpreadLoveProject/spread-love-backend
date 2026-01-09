import multer from "multer";

import { UPLOAD } from "../constants/common.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGE.FILE_SIZE_EXCEEDED,
      });
    }
  }

  next(err);
};

export { handleUploadError, upload };
