import { CONCURRENCY } from "../constants/common.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const state = {
  activeRequests: 0,
};

const concurrencyLimit = (req, res, next) => {
  if (state.activeRequests >= CONCURRENCY.MAX_CAPTURES) {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGE.CONCURRENCY_LIMIT_EXCEEDED,
    });
  }

  state.activeRequests++;

  res.on("finish", () => {
    state.activeRequests--;
  });

  next();
};
export { concurrencyLimit };
