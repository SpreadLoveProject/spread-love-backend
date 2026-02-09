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

export const ERROR_CODE = {
  TOKEN_REQUIRED: "TOKEN_REQUIRED",
  GUEST_TOKEN_EXPIRED: "GUEST_TOKEN_EXPIRED",
  USER_TOKEN_EXPIRED: "USER_TOKEN_EXPIRED",
  INVALID_GUEST_TOKEN: "INVALID_GUEST_TOKEN",
  INVALID_USER_TOKEN: "INVALID_USER_TOKEN",
  UNKNOWN_TOKEN_TYPE: "UNKNOWN_TOKEN_TYPE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  IP_NOT_FOUND: "IP_NOT_FOUND",
};

export const ERROR_MESSAGE = {
  BAD_REQUEST: "잘못된 요청 형식입니다.",
  UNAUTHORIZED: "유효하지 않은 인증 토큰입니다.",
  HISTORY_NOT_FOUND: "히스토리를 찾을 수 없습니다.",
  TOKEN_REQUIRED: "인증 토큰이 필요합니다.",
  GUEST_TOKEN_EXPIRED: "게스트 토큰이 만료되었습니다.",
  USER_TOKEN_EXPIRED: "사용자 토큰이 만료되었습니다. 다시 로그인해주세요.",
  INVALID_GUEST_TOKEN: "유효하지 않은 게스트 토큰입니다.",
  INVALID_USER_TOKEN: "유효하지 않은 사용자 토큰입니다.",
  UNKNOWN_TOKEN_TYPE: "알 수 없는 토큰 형식입니다. guest_ 또는 user_ prefix가 필요합니다.",
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  IMAGE_REQUIRED: "이미지 파일이 필요합니다.",
  IMAGE_URL_REQUIRED: "이미지 URL이 필요합니다.",
  IMAGE_FETCH_FAILED: "이미지를 가져올 수 없습니다.",
  FILE_SIZE_EXCEEDED: "파일 크기가 너무 큽니다. (최대 5MB)",
  RATE_LIMIT_EXCEEDED: "일일 사용 횟수를 초과했습니다.",
  URL_REQUIRED: "URL이 필요합니다.",
  INVALID_URL: "유효하지 않은 URL입니다.",
  PAGE_LOAD_TIMEOUT: "페이지 로딩 시간이 초과되었습니다.",
  PAGE_CAPTURE_FAILED: "페이지 캡처에 실패했습니다.",
  CONCURRENCY_LIMIT_EXCEEDED: "요청이 많습니다. 잠시 후 다시 시도해주세요.",
  IP_NOT_FOUND: "IP 주소를 확인할 수 없습니다.",
};
