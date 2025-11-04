export class AppResult {
    static ok(data) {
        return { kind: "ok", data };
    }
    static reject(code, message, data) {
        return { kind: "reject", code, message, data };
    }
    static error(serviceName, errorCode, message, data) {
        return { kind: "error", serviceName, errorCode, message, data };
    }
}
AppResult.reject('CONFLICT', 'Unauthorized');
