import OpenAI from "openai";

import { ERROR_CONFIG, HTTP_STATUS } from "../constants/errorCodes.js";
import { AppError } from "../errors/AppError.js";

export const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  if (err.name === "TokenExpiredError") {
    const config = ERROR_CONFIG.AUTH_TOKEN_EXPIRED;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "AUTH_TOKEN_EXPIRED",
        message: config.message,
      },
    });
  }

  if (err.name === "JsonWebTokenError") {
    const config = ERROR_CONFIG.AUTH_TOKEN_INVALID;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "AUTH_TOKEN_INVALID",
        message: config.message,
      },
    });
  }

  if (err instanceof OpenAI.RateLimitError) {
    const config = ERROR_CONFIG.OPENAI_RATE_LIMIT;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "OPENAI_RATE_LIMIT",
        message: config.message,
      },
    });
  }

  if (err instanceof OpenAI.AuthenticationError) {
    const config = ERROR_CONFIG.OPENAI_AUTH_ERROR;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "OPENAI_AUTH_ERROR",
        message: config.message,
      },
    });
  }

  if (err instanceof OpenAI.APIConnectionError) {
    const config = ERROR_CONFIG.OPENAI_TIMEOUT;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "OPENAI_TIMEOUT",
        message: config.message,
      },
    });
  }

  if (err.status === 402 || err.code === "insufficient_quota") {
    const config = ERROR_CONFIG.OPENAI_INSUFFICIENT_QUOTA;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "OPENAI_INSUFFICIENT_QUOTA",
        message: config.message,
      },
    });
  }

  if (err instanceof OpenAI.APIError) {
    const config = ERROR_CONFIG.OPENAI_API_ERROR;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "OPENAI_API_ERROR",
        message: config.message,
      },
    });
  }

  if (
    err.code?.startsWith?.("PGRST") ||
    err.code?.startsWith?.("22") ||
    err.code?.startsWith?.("23")
  ) {
    const config = ERROR_CONFIG.DB_ERROR;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "DB_ERROR",
        message: config.message,
      },
    });
  }

  if (err.message?.includes("ECONNREFUSED") || err.name === "ReplyError") {
    const config = ERROR_CONFIG.REDIS_ERROR;
    return res.status(config.status).json({
      success: false,
      error: {
        code: "REDIS_ERROR",
        message: config.message,
      },
    });
  }

  const config = ERROR_CONFIG.SYSTEM_INTERNAL_ERROR;
  return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    error: {
      code: "SYSTEM_INTERNAL_ERROR",
      message: config.message,
    },
  });
};
