import { z } from "zod";
export declare class ResponseSchemaException extends Error {
    constructor(message: string);
}
interface ResponseSchemaOptions {
    strict?: boolean;
}
/**
 * Method decorator:
 * - Accepts a Zod schema
 * - Before sending the response, strips any fields not defined in the schema
 * - Applies Zod default()/transform() on the output
 */
export declare function ResponseSchema<T extends z.ZodTypeAny>(schema: T, options?: ResponseSchemaOptions): MethodDecorator;
export declare const OutputData: typeof ResponseSchema;
export {};
