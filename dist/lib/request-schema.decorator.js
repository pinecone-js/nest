import { HttpException, HttpStatus, createParamDecorator } from '@nestjs/common';
function isZodObject(x) {
    return x && x._def?.typeName === 'ZodObject';
}
/**
 * Get top-level keys from schema (ZodObject).
 * If not an object, don't filter keys (keep merge as is).
 */
function getSchemaKeys(schema) {
    if (!isZodObject(schema))
        return null;
    return Object.keys(schema.shape);
}
/** Lightly coerce primitive from string -> number/bool; "a,b" -> ["a","b"] for simple arrays */
function shallowCoerce(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v !== 'string') {
            out[k] = v;
            continue;
        }
        const s = v.trim();
        // // boolean
        if (s === 'true') {
            out[k] = true;
            continue;
        }
        if (s === 'false') {
            out[k] = false;
            continue;
        }
        // number (integer/float)
        if (!Number.isNaN(Number(s)) && s !== '') {
            out[k] = Number(s);
            continue;
        }
        // csv -> array (a,b,c)
        if (s.includes(',')) {
            out[k] = s.split(',').map((x) => x.trim());
            continue;
        }
        out[k] = s;
    }
    return out;
}
/** Merge by source order + firstWins/lastWins strategy, only pick needed keys (if any) */
function collectFromRequest(req, keys, opts) {
    const ordered = opts.sourceOrder.map((src) => req?.[src] ?? {});
    let merged = {};
    const apply = (srcObj, overwrite) => {
        if (keys && keys.length > 0) {
            for (const k of keys) {
                if (srcObj[k] === undefined)
                    continue;
                if (overwrite)
                    merged[k] = srcObj[k];
                else if (merged[k] === undefined)
                    merged[k] = srcObj[k];
            }
        }
        else {
            // no keys from schema -> take all (rarely used)
            for (const [k, v] of Object.entries(srcObj)) {
                if (overwrite)
                    merged[k] = v;
                else if (merged[k] === undefined)
                    merged[k] = v;
            }
        }
    };
    if (opts.strategy === 'firstWins') {
        for (const src of ordered)
            apply(src, false);
    }
    else {
        for (const src of ordered)
            apply(src, true);
    }
    return opts.coercePrimitives ? shallowCoerce(merged) : merged;
}
/**
 * @AcceptInput(schema, options?) — collect input from params/query/body, validate with Zod, return parsed data.
 * Usage in handler:
 *    handler(@AcceptInput(MySchema) input: z.infer<typeof MySchema>) {}
 */
export function RequestSchema(schema, options) {
    const opts = {
        sourceOrder: options?.sourceOrder ?? ['params', 'query', 'body'],
        strategy: options?.strategy ?? 'firstWins',
        strict: options?.strict ?? true,
        coercePrimitives: options?.coercePrimitives ?? true,
        attachTo: options?.attachTo ?? null,
    };
    const decoratorFactory = createParamDecorator((_data, ctx) => {
        const req = ctx.switchToHttp().getRequest();
        // Prepare schema: strict() or passthrough()
        let effective = schema;
        if (isZodObject(schema)) {
            effective = opts.strict
                ? schema.strict()
                : schema.loose();
        }
        // Keys to collect (top-level)
        const keys = getSchemaKeys(schema);
        // Merge & coerce (raw)
        const raw = collectFromRequest(req, keys, {
            sourceOrder: opts.sourceOrder,
            strategy: opts.strategy,
            coercePrimitives: opts.coercePrimitives,
        });
        // Validate + transform/default with Zod
        const result = effective.safeParse(raw);
        if (!result.success) {
            const errors = result.error.issues.map((err) => {
                const msg = err.message.split(':').pop().trim();
                return `${String(err.path[0])}: ${msg}`;
            });
            throw new HttpException({
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                data: errors,
            }, HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (opts.attachTo) {
            // attach to request to use in other layers if needed
            req[opts.attachTo] = result.data;
        }
        return result.data;
    });
    // return the actual param decorator
    return decoratorFactory();
}
// Alias for RequestSchema
export const InputData = RequestSchema;
