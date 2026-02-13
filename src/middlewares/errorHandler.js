import OpenAI from "openai";

import logger from "../config/logger.js";
import { ERROR_CONFIG } from "../constants/errorCodes.js";
import { AppError } from "../errors/AppError.js";

const sendError = (res, code, config) => {
  return res.status(config.status).json({
    success: false,
    error: { code, message: config.message },
  });
};

export const errorHandler = (err, req, res, _next) => {
  logger.error(err.stack);

  if (err instanceof AppError) {
    return sendError(res, err.code, err);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "AUTH_TOKEN_EXPIRED", ERROR_CONFIG.AUTH_TOKEN_EXPIRED);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, "AUTH_TOKEN_INVALID", ERROR_CONFIG.AUTH_TOKEN_INVALID);
  }

  if (err instanceof OpenAI.RateLimitError) {
    return sendError(res, "OPENAI_RATE_LIMIT", ERROR_CONFIG.OPENAI_RATE_LIMIT);
  }

  if (err instanceof OpenAI.AuthenticationError) {
    return sendError(res, "OPENAI_AUTH_ERROR", ERROR_CONFIG.OPENAI_AUTH_ERROR);
  }

  if (err instanceof OpenAI.APIConnectionError) {
    return sendError(res, "OPENAI_TIMEOUT", ERROR_CONFIG.OPENAI_TIMEOUT);
  }

  if (err.status === 402 || err.code === "insufficient_quota") {
    return sendError(res, "OPENAI_INSUFFICIENT_QUOTA", ERROR_CONFIG.OPENAI_INSUFFICIENT_QUOTA);
  }

  if (err instanceof OpenAI.APIError) {
    return sendError(res, "OPENAI_API_ERROR", ERROR_CONFIG.OPENAI_API_ERROR);
  }

  if (
    err.code?.startsWith?.("PGRST") ||
    err.code?.startsWith?.("22") ||
    err.code?.startsWith?.("23")
  ) {
    return sendError(res, "DB_ERROR", ERROR_CONFIG.DB_ERROR);
  }

  if (err.message?.includes("ECONNREFUSED") || err.name === "ReplyError") {
    return sendError(res, "REDIS_ERROR", ERROR_CONFIG.REDIS_ERROR);
  }

  return sendError(res, "SYSTEM_INTERNAL_ERROR", ERROR_CONFIG.SYSTEM_INTERNAL_ERROR);
};
