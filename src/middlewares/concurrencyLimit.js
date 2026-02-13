import { CONCURRENCY } from "../constants/common.js";
import { AppError } from "../errors/AppError.js";

const state = {
  activeRequests: 0,
};

const concurrencyLimit = (req, res, next) => {
  if (state.activeRequests >= CONCURRENCY.MAX_CAPTURES) {
    throw new AppError("RATE_LIMIT_CONCURRENCY_EXCEEDED");
  }

  state.activeRequests++;

  res.on("close", () => {
    state.activeRequests--;
  });

  next();
};

export { concurrencyLimit };
