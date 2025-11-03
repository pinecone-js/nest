import { z } from 'zod';
type Source = 'params' | 'query' | 'body';
export type AcceptInputOptions = {
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
export declare function RequestSchema<T extends z.ZodTypeAny>(schema: T, options?: AcceptInputOptions): ParameterDecorator;
export declare const InputData: typeof RequestSchema;
export {};
