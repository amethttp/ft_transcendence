export const ErrorParams = {
  USER_NOT_FOUND: { code: 404, message: "USER_NOT_FOUND" },
  UNAUTHORIZED_USER_ACTION: { code: 403, message: "UNAUTHORIZED_USER_ACTION" },
  AUTH_EXPIRED_ACCESS: { code: 401, message: "AUTH_EXPIRED_ACCESS" },
  AUTH_INVALID_ACCESS: { code: 401, message: "AUTH_INVALID_ACCESS" },
  LOGIN_FAILED: { code: 400, message: "LOGIN_FAILED" },
  REGISTRATION_INVALID_USERNAME: { code: 400, message: "REGISTRATION_INVALID_USERNAME" },
  REGISTRATION_INVALID_EMAIL: { code: 400, message: "REGISTRATION_INVALID_EMAIL" },
  REGISTRATION_INVALID_PASSWORD: { code: 400, message: "REGISTRATION_INVALID_PASSWORD" },
  REGISTRATION_FAILED: { code: 400, message: "REGISTRATION_FAILED" },
  UNKNOWN_SERVER_ERROR: { code: 500, message: "UNKNOWN_SERVER_ERROR" },
} as const;

export type ErrorParamsType = typeof ErrorParams[keyof typeof ErrorParams];

interface ResponseErrorDTO {
  error: string;
}

export class ResponseError extends Error {
  private _code: number;
  constructor(params: ErrorParamsType) {
    super();
    this.name = "ResponseError";
    this._code = params.code;
    this.message = params.message;
  }

  toDto(): ResponseErrorDTO {
    return { error: this.message };
  }

  get code() {
    return this._code;
  }
}
