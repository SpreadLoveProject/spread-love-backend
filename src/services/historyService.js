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

const getHistories = async (userId) => {
  const { data, error } = await supabase
    .from("histories")
    .select("id, content_type, contents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    contentType: item.content_type,
    contents: { title: item.contents.title },
    createdAt: item.created_at,
  }));
};

const getHistoryById = async (_userId, _historyId) => {};

export { getHistories, getHistoryById, saveHistory };
