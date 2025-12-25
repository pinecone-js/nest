import {
  addHandler,
  ConfigKey,
  getConfigs,
  setConfig,
} from "./config";
import { InfraError } from "./messaging/app-message";
import { Output } from "./messaging/http-output";

export * from "./messaging/input.decorator";
export * from "./messaging/output.decorator";
export * from "./messaging/app-message";
export * from "./messaging/http-output";
export * from "./helpers/error-helper";

export class Pinecone {
  static configure(configs: Partial<Record<ConfigKey, any>>): void {
    for (const [key, value] of Object.entries(configs)) {
      setConfig(key as ConfigKey, value);
    }
  }

  static onUsecaseError(callback: (error: Error | InfraError) => void): void {
    addHandler("usecase.error.report", callback);
  }

  static addLogger(
    callback: (props: {
      ucName: string;
      input: unknown[];
      output: Output<any> | null;
      exception: Error | null;
      duration: number;
    }) => void
  ): void {
    addHandler("usecase.logging", callback);
  }

  static getConfigs(): Record<ConfigKey, any> {
    return getConfigs();
  }
}
