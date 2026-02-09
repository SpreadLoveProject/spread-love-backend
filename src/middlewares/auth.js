import { verifyToken } from "../config/jwt.js";
import { supabase } from "../config/supabase.js";
import { ERROR_CODE, ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        errorCode: ERROR_CODE.TOKEN_REQUIRED,
        error: ERROR_MESSAGE.TOKEN_REQUIRED,
      });
    }

    const fullToken = authHeader.slice(7);

    if (fullToken.startsWith("guest_")) {
      const token = fullToken.slice(6);

      try {
        const decoded = verifyToken(token);

        if (!decoded.guestId) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            errorCode: ERROR_CODE.INVALID_GUEST_TOKEN,
            error: ERROR_MESSAGE.INVALID_GUEST_TOKEN,
          });
        }

        req.guestId = decoded.guestId;
        return next();
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            errorCode: ERROR_CODE.GUEST_TOKEN_EXPIRED,
            error: ERROR_MESSAGE.GUEST_TOKEN_EXPIRED,
          });
        }
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          errorCode: ERROR_CODE.INVALID_GUEST_TOKEN,
          error: ERROR_MESSAGE.INVALID_GUEST_TOKEN,
        });
      }
    } else if (fullToken.startsWith("user_")) {
      const token = fullToken.slice(5);

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        const isExpired = error?.message?.toLowerCase().includes("expired");

        if (isExpired) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            errorCode: ERROR_CODE.USER_TOKEN_EXPIRED,
            error: ERROR_MESSAGE.USER_TOKEN_EXPIRED,
          });
        }

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          errorCode: ERROR_CODE.INVALID_USER_TOKEN,
          error: ERROR_MESSAGE.INVALID_USER_TOKEN,
        });
      }

      req.userId = data.user.id;
      return next();
    } else {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        errorCode: ERROR_CODE.UNKNOWN_TOKEN_TYPE,
        error: ERROR_MESSAGE.UNKNOWN_TOKEN_TYPE,
      });
    }
  } catch (error) {
    next(error);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      errorCode: ERROR_CODE.LOGIN_REQUIRED,
      error: ERROR_MESSAGE.LOGIN_REQUIRED,
    });
  }
  next();
};

export { authenticate, requireAuth };
