import { verifyToken } from "../config/jwt.js";
import { supabase } from "../config/supabase.js";
import { AppError } from "../errors/AppError.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("AUTH_TOKEN_REQUIRED");
  }

  const fullToken = authHeader.slice(7);

  if (fullToken.startsWith("guest_")) {
    const token = fullToken.slice(6);

    try {
      const decoded = verifyToken(token);

      if (!decoded.guestId) {
        throw new AppError("AUTH_GUEST_TOKEN_INVALID");
      }

      req.guestId = decoded.guestId;
      return next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.name === "TokenExpiredError") {
        throw new AppError("AUTH_GUEST_TOKEN_EXPIRED");
      }
      throw new AppError("AUTH_GUEST_TOKEN_INVALID");
    }
  } else if (fullToken.startsWith("user_")) {
    const token = fullToken.slice(5);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      const isExpired = error?.message?.toLowerCase().includes("expired");

      if (isExpired) {
        throw new AppError("AUTH_USER_TOKEN_EXPIRED");
      }

      throw new AppError("AUTH_USER_TOKEN_INVALID");
    }

    req.userId = data.user.id;
    return next();
  } else {
    throw new AppError("AUTH_TOKEN_TYPE_UNKNOWN");
  }
};

const requireAuth = (req, res, next) => {
  if (!req.userId) {
    throw new AppError("AUTH_LOGIN_REQUIRED");
  }
  next();
};

export { authenticate, requireAuth };
