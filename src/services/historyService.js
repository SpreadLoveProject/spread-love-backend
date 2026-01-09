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

const getHistoryById = async (userId, historyId) => {
  const { data, error } = await supabase
    .from("histories")
    .select("id, content_type, url, contents, created_at")
    .eq("id", historyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code === "22P02") {
    const badRequestError = new Error("잘못된 요청 형식입니다.");
    badRequestError.status = 400;
    throw badRequestError;
  }

  if (error) throw error;

  if (!data) {
    const notFoundError = new Error("히스토리를 찾을 수 없습니다.");
    notFoundError.status = 404;
    throw notFoundError;
  }

  return {
    id: data.id,
    contentType: data.content_type,
    url: data.url,
    contents: data.contents,
    createdAt: data.created_at,
  };
};

export { getHistories, getHistoryById, saveHistory };
