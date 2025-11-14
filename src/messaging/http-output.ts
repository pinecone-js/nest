import { Logger } from "@nestjs/common";
import { Message } from "./app-message";
import { getConfig } from "../config";
import { rescue } from "../helpers/rescue";

const logger = new Logger("Pinecone/SendResp");

export interface Output<T> {
  code: string;
  data?: T;
  message?: string;
}

export class SendOutput {
  static fail<T>(code: string, message?: string, data?: T): Output<T> {
    return {
      code,
      message,
      data,
    };
  }

  static success<T>(data: T): Output<T> {
    return {
      code: "OK",
      data,
    };
  }

  static fromMessage<T extends unknown>(
    result: Message<T>,
    presenter?: (data: any) => any
  ): Output<T> {
    switch (result.kind) {
      case "ok":
        return this.success(presenter ? presenter(result.data) : result.data);
      case "reject":
        // ✋ Hey dev! This is the business logic error
        // => Send clear error message to the Client
        return this.fail<T>(result.code, result.message, result.data as T);
      case "infra-error":
        // 👉 This is the infrastructure error
        // => Send generic error message to the Client and log the error and alert the Team
        return this.fail<T>(
          "INTERNAL_ERROR",
          "Something went wrong while processing your request. " +
            "Our team's been notified, but feel free to contact support if this keeps happening.",
          result.data as T
        );
    }
  }

  private static report(error: any) {
    if (error) {
      const message = [
        `USECASE ERROR`,
        `INPUT: {}`,
        `RESULT: {}`,
        `STACK: ${error?.stack?.toString()}`,
      ].join(" | ");

      logger.error(message);

      const hook = getConfig<((error: any) => void) | null>(
        "hook.output.report"
      );

      if (hook) {
        rescue(() => hook(error));
      }

      if (getConfig<boolean>("debug", false)) {
        logger.debug("Captured error: " + JSON.stringify(error));
      }
    }
  }

  static async fromUsecase<T>(
    work: Promise<Message<T>>
  ): Promise<Output<T>> {
    try {
      const result = await work;

      return this.fromMessage(result);
    } catch (error: any) {
      this.report(error);
      return this.fail(
        "INTERNAL_ERROR",
        "Something went wrong while processing your request. " +
          "Our team's been notified, but feel free to contact support if this keeps happening."
      );
    }
  }
}
