import { supabase } from "../config/supabase.js";

const saveHistory = async ({ userId, url, title, summary }) => {
  const { data, error } = await supabase
    .from("histories")
    .insert({
      user_id: userId,
      content_type: "summary",
      url,
      contents: { title, summary },
    })
    .select("id")
    .single();

  if (error) throw error;

  return data?.id || null;
};

export { saveHistory };
