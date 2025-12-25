import { addHandler, SettingKey, getSettings, setSetting } from "./settings";
import { Output, UsecaseErrorReporter } from "./messaging/http-output";

export * from "./messaging/input.decorator";
export * from "./messaging/output.decorator";
export * from "./messaging/app-message";
export * from "./messaging/http-output";
export * from "./helpers/error-helper";

/**
 * PUBLIC API for the Pinecone framework configuration.
 */
export class Pinecone {
  /**
   * Configure the Pinecone framework. This api use for master.
   * @param configs - The configurations to be set.
   */
  static configure(configs: Partial<Record<SettingKey, any>>): void {
    for (const [key, value] of Object.entries(configs)) {
      setSetting(key as SettingKey, value);
    }
  }

  /**
   * Add a usecase error reporter to the Pinecone framework.
   * @param callback - The callback function to be called when a usecase error is reported.
   */
  static onUsecaseError(callback: UsecaseErrorReporter): void {
    addHandler("usecase.error.report", callback);
  }

  /**
   * Add a logger to the Pinecone framework.
   * @param callback - The callback function to be called when a usecase is executed.
   */
  static addLogger(
    callback: (props: {
      ucName: string;
      input: unknown[];
      output: Output<any> | null;
      exception: Error | string | null;
      duration: number;
    }) => void
  ): void {
    addHandler("usecase.logging", callback);
  }

  static logExceptionAsString() {
    setSetting("logExceptionAsString", true);
  }

  /**
   * Get the current settings of the Pinecone framework.
   */
  static getSettings(): Record<SettingKey, any> {
    return getSettings();
  }
}
