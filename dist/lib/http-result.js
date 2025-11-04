export class HttpResult {
    static fail(code, message, data) {
        return {
            code,
            message,
            data,
        };
    }
    static success(data) {
        return {
            code: 'OK',
            data,
        };
    }
    static fromResult(result, presenter) {
        switch (result.kind) {
            case 'ok':
                return this.success(presenter ? presenter(result.data) : result.data);
            case 'reject':
                // ✋ Hey dev! This is the business logic error
                // => Send clear error message to the Client
                return this.fail(result.code, result.message, result.data);
            case 'infra-error':
                // 👉 This is the infrastructure error
                // => Send generic error message to the Client and log the error and alert the Team
                return this.fail('INTERNAL_ERROR', 'Something went wrong while processing your request. ' +
                    "Our team's been notified, but feel free to contact support if this keeps happening.", result.data);
        }
    }
}
