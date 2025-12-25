import { Logger } from "@nestjs/common";
import { InfraError, Message } from "./app-message";
import { getHandlers } from "../config";
import { rescue } from "../helpers/rescue";
import { ErrorHelper } from "../helpers/error-helper";

const logger = new Logger("Pinecone/SendResp");

export interface Output<T> {
  success: boolean;
  code: string;
  data: T | null;
  message: string;
};

export interface Usecase<T> {
  execute(...args: unknown[]): Promise<Message<T>>;
}

export class SendOutput {
  static fail<T>(
    code: string,
    message: string = "",
    data: T | null = null
  ): Output<T> {
    return {
      success: false,
      code,
      message,
      data,
    };
  }

  static success<T>(data: T): Output<T> {
    return {
      success: true,
      data,
      code: "OK",
      message: "",
    };
  }

  private static fromMessage<T extends unknown>(
    result: Message<T>,
    presenter?: (data: any) => T
  ): Output<T> {
    switch (result.kind) {
      case "ok":
        return this.success(presenter ? presenter(result.data) : result.data);
      case "reject":
        return this.fail<T>(result.code, result.message, result.data as T);
      case "infra-error":
        this.reportError(result);
        return this.unhandledError<T>(result.data as T);
    }
  }

  static async fromUsecase<T>(usecase: Usecase<T>, ...args: unknown[]): Promise<Output<T>> {
    const start = new Date();
    let exception: Error | null = null;
    let output: Output<T> | null = null;
    const ucName = usecase.constructor.name;
    const input = args;

    try {
      output = this.fromMessage(await usecase.execute(...args));
    } catch (error: any) {
      error = error as Error;
    }

    // Send the log to the system.
    const duration = new Date().getTime() - start.getTime();
    this.logUcExecution({
      ucName,
      input,
      output,
      exception,
      duration,
    });

    if (output) return output;

    /**
     * When there is an error catched by try/catch.
     * This is unwanted case, or a bug in the code. It should be report to the Admin, and return an default error response.
     */
    if (exception) {
      this.reportError(exception);
    }
    return this.unhandledError<T>();
  }

  private static unhandledError<T>(data?: T) {
    return this.fail(
      "INTERNAL_ERROR",
      "Something went wrong while processing your request. " +
        "Our team's been notified, but feel free to contact support if this keeps happening.",
      data as T
    );
  }

  private static reportError(error: Error | InfraError) {
    if (error) {
      const code = "code" in error ? error.code : "UNKNOWN_ERROR";
      const data = JSON.stringify("data" in error ? error.data : {});
      const message = [
        `USECASE ERR: ${error.message}`,
        `CODE: ${code}`,
        `DATA: ${data}`,
        `STACK: ${
          error instanceof Error ? ErrorHelper.formatStack(error) : ""
        }`,
      ].join(" | ");

      logger.error(message);

      getHandlers("usecase.error.report").forEach((handler) =>
        rescue(() => handler(error))
      );
    }
  }

  private static logUcExecution<T>(props: {
    ucName: string;
    input: Record<string, any>;
    output: Output<T> | null;
    exception: Error | null;
    duration: number;
  }) {
    getHandlers("usecase.logging").forEach((handler) =>
      rescue(() => handler(props))
    );
  }
}
