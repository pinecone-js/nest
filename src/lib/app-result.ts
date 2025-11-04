interface Ok<T> {
  kind: "ok";
  data: T;
}

interface Rejection {
  kind: "reject";
  code: string;
  message: string;
  data?: unknown;
}

interface Error {
  kind: "error";
  serviceName: string;
  errorCode: string;
  message: string;
  data?: unknown;
}

export type Result<T> = Ok<T> | Rejection | Error;

type ErrorCode = string;

export class AppResult {
  static ok<T>(data: T): Result<T> {
    return { kind: "ok", data };
  }

  static reject(code: ErrorCode, message: string, data?: unknown): Result<any> {
    return { kind: "reject", code, message, data };
  }

  static error(
    serviceName: string,
    errorCode: ErrorCode,
    message: string,
    data?: unknown
  ): Result<any> {
    return { kind: "error", serviceName, errorCode, message, data };
  }
}



AppResult.reject('CONFLICT', 'Unauthorized');