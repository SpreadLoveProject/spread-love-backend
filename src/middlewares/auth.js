import env from "../config/env.js";
import { supabase } from "../config/supabase.js";
import { ERROR_MESSAGE, HTTP_STATUS } from "../constants/errorCodes.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.userId = null;

      return next();
    }

    const token = authHeader.slice(7);

    if (token === env.DEV_TOKEN) {
      req.userId = env.DEV_USER_ID;

      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);

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

export { authMiddleware };
