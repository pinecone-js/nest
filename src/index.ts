import { addHook, ConfigKey, getConfigs, HookKey, setConfig } from "./config";

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

  static hook(key: HookKey, callback: (...args: any[]) => void): void {
    addHook(key, callback);
  }

  static getConfigs(): Record<ConfigKey, any> {
    return getConfigs();
  }
}
