import { supabase } from "../config/supabase.js";

const authMiddleware = async (req, _res, next) => {
  let userId = null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    userId = data.user?.id || null;
  }

  req.userId = userId;
  next();
};

export { authMiddleware };
