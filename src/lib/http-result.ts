import { Result } from './app-result';

export interface HttpResponse<T> {
  code: string;
  data?: T;
  message?: string;
}

export class HttpResult {
  static fail<T>(code: string, message?: string, data?: T): HttpResponse<T> {
    return {
      code,
      message,
      data,
    };
  }

  static success<T>(data: T): HttpResponse<T> {
    return {
      code: 'OK',
      data,
    };
  }

  static fromResult<T extends unknown>(
    result: Result<T>,
    presenter?: (data: any) => any,
  ): HttpResponse<T> {
    switch (result.kind) {
      case 'ok':
        return this.success(presenter ? presenter(result.data) : result.data);
      case 'reject':
        // ✋ Hey dev! This is the business logic error
        // => Send clear error message to the Client
        return this.fail<T>(result.code, result.message, result.data as T);
      case 'error':
        // 👉 This is the infrastructure error
        // => Send generic error message to the Client and log the error and alert the Team
        return this.fail<T>(
          'INTERNAL_ERROR',
          'Something went wrong while processing your request. ' +
            "Our team's been notified, but feel free to contact support if this keeps happening.",
          result.data as T,
        );
    }
  }
}
