import env from "../config/env.js";
import { supabase } from "../config/supabase.js";

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

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: "유효하지 않은 인증 토큰입니다.",
      });
    }

    req.userId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
};

export { authMiddleware };
