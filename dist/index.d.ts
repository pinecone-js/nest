import { z } from 'zod';

type Source = 'params' | 'query' | 'body';
type AcceptInputOptions = {
    sourceOrder?: Source[];
    strategy?: 'firstWins' | 'lastWins';
    strict?: boolean;
    coercePrimitives?: boolean;
    attachTo?: string | null;
};
/**
 * @AcceptInput(schema, options?) — collect input from params/query/body, validate with Zod, return parsed data.
 * Usage in handler:
 *    handler(@AcceptInput(MySchema) input: z.infer<typeof MySchema>) {}
 */
declare function RequestSchema<T extends z.ZodTypeAny>(schema: T, options?: AcceptInputOptions): ParameterDecorator;
declare const InputData: typeof RequestSchema;

interface ResponseSchemaOptions {
    strict?: boolean;
}
/**
 * Method decorator:
 * - Accepts a Zod schema
 * - Before sending the response, strips any fields not defined in the schema
 * - Applies Zod default()/transform() on the output
 */
declare function ResponseSchema<T extends z.ZodTypeAny>(schema: T, options?: ResponseSchemaOptions): MethodDecorator;
declare const OutputData: typeof ResponseSchema;

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
type Result<T> = Ok<T> | Rejection | InfraError;
type ErrorCode = string;
declare class AppResult {
    static ok<T>(data: T): Result<T>;
    static reject(code: ErrorCode, message: string, data?: unknown): Result<any>;
    static infraError(serviceName: string, errorCode: ErrorCode, message: string, data?: unknown): Result<any>;
}

interface HttpResponse<T> {
    code: string;
    data?: T;
    message?: string;
}
declare class HttpResult {
    static fail<T>(code: string, message?: string, data?: T): HttpResponse<T>;
    static success<T>(data: T): HttpResponse<T>;
    static fromResult<T extends unknown>(result: Result<T>, presenter?: (data: any) => any): HttpResponse<T>;
}

export { AppResult, type HttpResponse, HttpResult, InputData, OutputData, RequestSchema, ResponseSchema, type Result };
