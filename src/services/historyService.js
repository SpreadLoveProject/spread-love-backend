import { supabase } from "../config/supabase.js";
import { PAGINATION } from "../constants/common.js";
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

const getHistories = async (
  userId,
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT,
) => {
  const offset = (page - 1) * limit;

  const { count, error: countError } = await supabase
    .from("histories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;

  const { data, error } = await supabase
    .from("histories")
    .select("id, content_type, url, contents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    histories: data.map((item) => ({
      id: item.id,
      contentType: item.content_type,
      url: item.url,
      contents: item.contents,
      createdAt: item.created_at,
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      limit,
    },
  };
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
