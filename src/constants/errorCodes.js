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

export const ERROR_CONFIG = {
  AUTH_TOKEN_REQUIRED: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "인증 토큰이 필요합니다.",
  },
  AUTH_TOKEN_EXPIRED: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "토큰이 만료되었습니다.",
  },
  AUTH_TOKEN_INVALID: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "유효하지 않은 토큰입니다.",
  },
  AUTH_GUEST_TOKEN_EXPIRED: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "게스트 토큰이 만료되었습니다.",
  },
  AUTH_GUEST_TOKEN_INVALID: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "유효하지 않은 게스트 토큰입니다.",
  },
  AUTH_USER_TOKEN_EXPIRED: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "사용자 토큰이 만료되었습니다. 다시 로그인해주세요.",
  },
  AUTH_USER_TOKEN_INVALID: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "유효하지 않은 사용자 토큰입니다.",
  },
  AUTH_TOKEN_TYPE_UNKNOWN: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "알 수 없는 토큰 형식입니다. guest_ 또는 user_ prefix가 필요합니다.",
  },
  AUTH_LOGIN_REQUIRED: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "로그인이 필요한 기능입니다.",
  },
  VALIDATION_URL_REQUIRED: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "URL이 필요합니다.",
  },
  VALIDATION_URL_INVALID: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "유효하지 않은 URL입니다.",
  },
  VALIDATION_IMAGE_URL_REQUIRED: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "이미지 URL이 필요합니다.",
  },
  VALIDATION_IMAGE_TYPE_INVALID: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "지원하지 않는 이미지 형식입니다.",
  },
  VALIDATION_FILE_SIZE_EXCEEDED: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "파일 크기가 너무 큽니다. (최대 5MB)",
  },
  VALIDATION_IP_NOT_FOUND: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "IP 주소를 확인할 수 없습니다.",
  },
  VALIDATION_HISTORY_ID_REQUIRED: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "히스토리 ID가 필요합니다.",
  },
  VALIDATION_BAD_REQUEST: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "잘못된 요청 형식입니다.",
  },
  RESOURCE_HISTORY_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    message: "히스토리를 찾을 수 없습니다.",
  },
  RATE_LIMIT_EXCEEDED: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: "일일 사용 횟수를 초과했습니다.",
  },
  RATE_LIMIT_CONCURRENCY_EXCEEDED: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: "요청이 많습니다. 잠시 후 다시 시도해주세요.",
  },
  OPENAI_RATE_LIMIT: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: "AI 서비스 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  },
  OPENAI_AUTH_ERROR: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "AI 서비스 연결에 문제가 발생했습니다.",
  },
  OPENAI_TIMEOUT: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "AI 응답 시간이 초과되었습니다. 다시 시도해주세요.",
  },
  OPENAI_INSUFFICIENT_QUOTA: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "AI 서비스를 일시적으로 사용할 수 없습니다.",
  },
  OPENAI_API_ERROR: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "AI 서비스에 일시적인 문제가 발생했습니다.",
  },
  PUPPETEER_PAGE_TIMEOUT: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "페이지 로딩 시간이 초과되었습니다.",
  },
  PUPPETEER_CAPTURE_FAILED: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "페이지 캡처에 실패했습니다.",
  },
  IMAGE_FETCH_FAILED: {
    status: HTTP_STATUS.BAD_REQUEST,
    message: "이미지를 가져올 수 없습니다.",
  },
  PARSE_JSON_FAILED: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
  },
  DB_ERROR: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "데이터베이스 오류가 발생했습니다.",
  },
  REDIS_ERROR: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "서버 오류가 발생했습니다.",
  },
  SYSTEM_INTERNAL_ERROR: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: "서버 오류가 발생했습니다.",
  },
};
