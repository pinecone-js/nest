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

interface InfraError {
  kind: "infra-error";
  serviceName: string;
  errorCode: string;
  message: string;
  data?: unknown;
}

export type Result<T> = Ok<T> | Rejection | InfraError;

type ErrorCode = string;

export class AppResult {
  static ok<T>(data: T): Result<T> {
    return { kind: "ok", data };
  }

  static reject(code: ErrorCode, message: string, data?: unknown): Result<any> {
    return { kind: "reject", code, message, data };
  }

  static infraError(
    serviceName: string,
    errorCode: ErrorCode,
    message: string,
    data?: unknown
  ): Result<any> {
    return { kind: "infra-error", serviceName, errorCode, message, data };
  }
}