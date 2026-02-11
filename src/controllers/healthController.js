import { redis } from "../config/redis.js";
import { supabase } from "../config/supabase.js";

const healthCheck = async (req, res) => {
  const supabaseStatus = await supabase.auth
    .getSession()
    .then(({ error }) => (error ? "disconnected" : "connected"))
    .catch(() => "disconnected");

  const redisStatus = await redis
    .ping()
    .then(() => "connected")
    .catch(() => "disconnected");

  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    supabase: supabaseStatus,
    redis: redisStatus,
  });
};

export { healthCheck };
