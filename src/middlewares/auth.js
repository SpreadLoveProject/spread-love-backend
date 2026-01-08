import { supabase } from "../config/supabase.js";

const authMiddleware = async (req, _res, next) => {
  try {
    let userId = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);

      if (data && data.user) {
        userId = data.user.id;
      }
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

export { authMiddleware };
