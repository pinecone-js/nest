import { Logger } from "@nestjs/common";
import { InfraError, Message } from "./app-message";
import { getConfig } from "../config";
import { rescue } from "../helpers/rescue";

const logger = new Logger("Pinecone/SendResp");

export type Output<T> = {
  success: boolean;
  code: string;
  data: T | null;
  message: string;
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

  static fromMessage<T extends unknown>(
    result: Message<T>,
    presenter?: (data: any) => T
  ): Output<T> {
    switch (result.kind) {
      case "ok":
        return this.success(presenter ? presenter(result.data) : result.data);
      case "reject":
        return this.fail<T>(result.code, result.message, result.data as T);
      case "infra-error":
        this.report(result);

        return this.unhandledError<T>(result.data as T);
    }
  }

  static async fromUsecase<T>(
    usecase: Promise<Message<T>>
  ): Promise<Output<T>> {
    try {
      return this.fromMessage(await usecase);
    } catch (error: any) {
      this.report(error);
      return this.unhandledError<T>(error.data);
    }
  }

  private static unhandledError<T>(data?: T) {
    return this.fail(
      "INTERNAL_ERROR",
      "Something went wrong while processing your request. " +
        "Our team's been notified, but feel free to contact support if this keeps happening.",
      data as T
    );
  }

  private static report(error: Error | InfraError) {
    if (error) {
      const message = [
        `USECASE ERR: ${error.message}`,
        `INPUT: {}`,
        `RESULT: {}`,
        `STACK: ${error instanceof Error ? error.stack?.toString() : ""}`,
      ].join(" | ");

      logger.error(message);

      const hook = getConfig<((error: Error | InfraError) => void) | null>(
        "hook.output.report"
      );

      if (hook) {
        rescue(() => hook(error));
      }
    }
  }
}
