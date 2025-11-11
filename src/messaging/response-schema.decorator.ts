import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  UseInterceptors,
  applyDecorators,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { z } from "zod";

export class ResponseSchemaException extends Error {
  constructor(message: string) {
    super(message);
  }
}

@Injectable()
class EnsureResponseInterceptor<T extends z.ZodTypeAny> implements NestInterceptor {
  constructor(
    private readonly schema: T,
    private readonly opts: ResponseSchemaOptions
  ) {}

  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((output: any) => {
        try {
          if (output.data) {
            if (output.code === "OK") {
              output.data = this.schema.parse(output.data);
            } else {
              // Do not parse the output if it is not OK. Because we does not support parsing the error response.
              // output = this.schema.parse(output);
            }
          }

          return output;
        } catch (error: any) {
          throw new ResponseSchemaException(error.message);
        }
      })
    );
  }
}

interface ResponseSchemaOptions {
  strict?: boolean;
}

@Injectable()
export class FinalizeResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((output: any) => {
        let statusCode = HttpStatus.OK;
        const isHttpResponse = output && typeof output === 'object' && 'code' in output;

        if (isHttpResponse) {
          if (output.code === "OK") {
            statusCode = HttpStatus.OK;
          } else if (output.code.startsWith("INTERNAL_")) {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          } else {
            statusCode = HttpStatus.BAD_REQUEST;
          }
        }

        response.status(statusCode);
        return output;
      })
    );
  }
}

/**
 * Method decorator:
 * - Accepts a Zod schema
 * - Before sending the response, strips any fields not defined in the schema
 * - Applies Zod default()/transform() on the output
 */
export function ResponseSchema<T extends z.ZodTypeAny>(
  schema: T,
  options?: ResponseSchemaOptions
): MethodDecorator {
  const opts: Required<ResponseSchemaOptions> = {
    strict: options?.strict ?? false,
  };
  return applyDecorators(
    UseInterceptors(new EnsureResponseInterceptor(schema, opts)),
    UseInterceptors(FinalizeResponseInterceptor)
  );
}

// Alias for ResponseSchema
export const OutputData: typeof ResponseSchema = ResponseSchema;
