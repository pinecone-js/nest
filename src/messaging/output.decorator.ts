import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
  UseInterceptors,
  applyDecorators,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { z } from "zod";
import { getConfig } from "../config";

const logger = new Logger("Pinecone/EnsureOutput");

class OutputSchemaException extends Error {
  constructor(message: string) {
    super(message);
  }
}

@Injectable()
class EnsureOutputInterceptor<T extends z.ZodTypeAny>
  implements NestInterceptor
{
  constructor(
    private readonly schema: T,
    private readonly opts: OutputSchemaOptions
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
          if (getConfig<boolean>("debug", false)) {
            logger.debug("Captured output: " + JSON.stringify(output));
          }
          throw new OutputSchemaException(error.message);
        }
      })
    );
  }
}

interface OutputSchemaOptions {
  strict?: boolean;
}

@Injectable()
class FinalizeOutputInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((output: any) => {
        let statusCode = HttpStatus.OK;
        const isHttpResponse =
          output && typeof output === "object" && "code" in output;

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
export function EnsureOutput<T extends z.ZodTypeAny>(
  schema: T,
  options?: OutputSchemaOptions
): MethodDecorator {
  const opts: Required<OutputSchemaOptions> = {
    strict: options?.strict ?? false,
  };
  return applyDecorators(
    UseInterceptors(new EnsureOutputInterceptor(schema, opts)),
    UseInterceptors(FinalizeOutputInterceptor)
  );
}
