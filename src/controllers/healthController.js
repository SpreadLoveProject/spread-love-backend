import { supabase } from "../config/supabase.js";

const healthCheck = async (req, res) => {
  try {
    const { error } = await supabase.auth.getSession();

    res.status(200).json({
      status: "OK",
      timestamp: new Date(),
      supabase: error ? "disconnected" : "connected",
    });
  } catch {
    res.status(200).json({
      status: "OK",
      timestamp: new Date(),
      supabase: "disconnected",
    });
  }
};

export { healthCheck };
