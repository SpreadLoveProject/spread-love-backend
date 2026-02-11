import dotenv from "dotenv";
dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENAI_API_KEY", "REDIS_URL", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  throw new Error(`필수 환경변수가 설정되지 않았습니다: ${missing.join(", ")}`);
}

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  DEV_TOKEN: process.env.DEV_TOKEN,
  DEV_USER_ID: process.env.DEV_USER_ID,
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};
