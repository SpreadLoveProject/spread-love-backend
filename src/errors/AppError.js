import { ERROR_CONFIG, HTTP_STATUS } from "../constants/errorCodes.js";

export class AppError extends Error {
  constructor(code) {
    const config = ERROR_CONFIG[code];

    super(config?.message || "서버 오류가 발생했습니다.");

    this.code = code;
    this.status = config?.status || HTTP_STATUS.INTERNAL_ERROR;
    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}
