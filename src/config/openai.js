import OpenAI from "openai";

import env from "./env.js";

if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY가 설정되지 않았습니다");
}

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
