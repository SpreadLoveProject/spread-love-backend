import { describe, expect, it } from "vitest";

import { AppError } from "./AppError.js";

describe("AppError", () => {
  it("에러 코드에 해당하는 메시지와 status를 설정한다", () => {
    const error = new AppError("AUTH_TOKEN_REQUIRED");

    expect(error.code).toBe("AUTH_TOKEN_REQUIRED");
    expect(error.message).toBe("인증 토큰이 필요합니다.");
    expect(error.status).toBe(401);
    expect(error.name).toBe("AppError");
  });

  it("알 수 없는 에러 코드는 기본값을 사용한다", () => {
    const error = new AppError("UNKNOWN_CODE");

    expect(error.code).toBe("UNKNOWN_CODE");
    expect(error.message).toBe("서버 오류가 발생했습니다.");
    expect(error.status).toBe(500);
  });

  it("Error를 상속받아 스택 트레이스를 캡처한다", () => {
    const error = new AppError("AUTH_TOKEN_REQUIRED");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.stack).toBeDefined();
  });
});
