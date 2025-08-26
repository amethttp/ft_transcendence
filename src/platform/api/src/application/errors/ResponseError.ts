export enum ErrorMsg {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  UNAUTHORIZED_USER_ACTION = "UNAUTHORIZED_USER_ACTION",
  AUTH_INVALID_REFRESH_TOKEN = "AUTH_INVALID_REFRESH_TOKEN",
  AUTH_COULDNT_SIGN_JWT = "AUTH_COULDNT_SIGN_JWT",
  AUTH_INVALID_REQUEST = "AUTH_INVALID_REQUEST",
  UNKNOWN_SERVER_ERROR = "UNKNOWN_SERVER_ERROR"
};

interface ResponseErrorDTO {
  error: string;
}

export class ResponseError extends Error {
  constructor(msg: ErrorMsg) {
    super();
    this.name = "ResponseError"
    this.message = msg;
  }

  toDto(): ResponseErrorDTO {
    return {error: this.message}
  }
}

