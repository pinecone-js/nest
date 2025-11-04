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
class EnsureResponseInterceptor<T extends z.ZodTypeAny> {
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
              output = this.schema.parse(output);
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
        if (output.code !== undefined && output.data) {
          if (output.code === "OK") {
            response.status(HttpStatus.OK);
          } else if (output.code.startsWith("INTERNAL_")) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR);
          } else {
            response.status(HttpStatus.BAD_REQUEST);
          }
          return output;
        }

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
    UseInterceptors(new FinalizeResponseInterceptor())
  );
}

// Alias for ResponseSchema
export const OutputData: typeof ResponseSchema = ResponseSchema;
