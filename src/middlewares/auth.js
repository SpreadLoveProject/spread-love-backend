import { supabase } from "../config/supabase.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const isTokenExpired = (error) => {
  return error && error.message && error.message.toLowerCase().includes("expired");
};

const checkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.userId = null;

      return next();
    }

    const token = authHeader.slice(7);

    const { data, error } = await supabase.auth.getUser(token);

    if (isTokenExpired(error)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGE.TOKEN_EXPIRED,
      });
    }

    if (error) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGE.TOKEN_VERIFICATION_FAILED,
      });
    }

    if (!data || !data.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGE.USER_NOT_FOUND,
      });
    }

    req.userId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGE.UNAUTHORIZED,
    });
  }
  next();
};

export { checkToken, requireAuth };
