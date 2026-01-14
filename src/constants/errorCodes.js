export const SUPABASE_ERROR = {
  INVALID_UUID: "22P02",
};

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

export const ERROR_MESSAGE = {
  BAD_REQUEST: "잘못된 요청 형식입니다.",
  UNAUTHORIZED: "유효하지 않은 인증 토큰입니다.",
  HISTORY_NOT_FOUND: "히스토리를 찾을 수 없습니다.",
  TOKEN_VERIFICATION_FAILED: "토큰 검증에 실패했습니다.",
  TOKEN_EXPIRED: "토큰이 만료되었습니다.",
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  IMAGE_REQUIRED: "이미지 파일이 필요합니다.",
  IMAGE_URL_REQUIRED: "이미지 URL이 필요합니다.",
  IMAGE_FETCH_FAILED: "이미지를 가져올 수 없습니다.",
  FILE_SIZE_EXCEEDED: "파일 크기가 너무 큽니다. (최대 5MB)",
  RATE_LIMIT_EXCEEDED: "일일 사용 횟수를 초과했습니다.",
};
