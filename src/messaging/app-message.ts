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

export interface InfraError {
  kind: "infra-error";
  service: string;
  code: string;
  message: string;
  data?: unknown;
}

export type Message<T> = Ok<T> | Rejection | InfraError;

export class ReturnMessage {
  static ok<T>(data: T): Message<T> {
    return { kind: "ok", data };
  }

  static reject(code: string, message: string, data?: unknown): Message<any> {
    return { kind: "reject", code, message, data };
  }

  static infraError(
    service: string,
    code: string,
    message: string,
    data?: unknown
  ): Message<any> {
    return { kind: "infra-error", service, code, message, data };
  }
}