import dotenv from "dotenv";
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
};
