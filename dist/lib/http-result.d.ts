import { Result } from './app-result';
export interface HttpResponse<T> {
    code: string;
    data?: T;
    message?: string;
}
export declare class HttpResult {
    static fail<T>(code: string, message?: string, data?: T): HttpResponse<T>;
    static success<T>(data: T): HttpResponse<T>;
    static fromResult<T extends unknown>(result: Result<T>, presenter?: (data: any) => any): HttpResponse<T>;
}
