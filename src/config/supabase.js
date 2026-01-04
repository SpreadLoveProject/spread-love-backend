import { createClient } from "@supabase/supabase-js";

import env from "./env.js";

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  throw new Error("SUPABASE_URL 또는 SUPABASE_KEY가 설정되지 않았습니다");
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
