import { verifyToken } from "../config/jwt.js";
import { supabase } from "../config/supabase.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const checkUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.userId = null;

      return next();
    }

    const token = authHeader.slice(7);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      req.userId = null;
      return next();
    }

    req.userId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
};

const checkGuestToken = async (req, res, next) => {
  try {
    if (req.userId) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGE.TOKEN_REQUIRED,
      });
    }

    const token = authHeader.slice(7);
    const { guestId } = await verifyToken(token);

    req.guestId = guestId;
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

export { checkGuestToken, checkUserToken, requireAuth };
