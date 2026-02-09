import { supabase } from "../config/supabase.js";
import { ERROR_MESSAGE, HTTP_STATUS, SUPABASE_ERROR } from "../constants/errorCodes.js";

const saveHistory = async ({ userId, url, title, summary, contentType }) => {
  const { data, error } = await supabase
    .from("histories")
    .insert({
      user_id: userId,
      content_type: contentType,
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

const deleteHistory = async (userId, historyId) => {
  const { data, error } = await supabase
    .from("histories")
    .delete()
    .eq("id", historyId)
    .eq("user_id", userId)
    .select("id");

  if (error && error.code === SUPABASE_ERROR.INVALID_UUID) {
    const badRequestError = new Error(ERROR_MESSAGE.BAD_REQUEST);

    badRequestError.status = HTTP_STATUS.BAD_REQUEST;
    throw badRequestError;
  }

  if (error) throw error;

  if (!data || data.length === 0) {
    const notFoundError = new Error(ERROR_MESSAGE.HISTORY_NOT_FOUND);

    notFoundError.status = HTTP_STATUS.NOT_FOUND;
    throw notFoundError;
  }

  return;
};

export { deleteHistory, getHistories, saveHistory };
