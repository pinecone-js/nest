import { ConfigKey, getConfigs, setConfig } from "./config";

export * from "./messaging/input.decorator";
export * from "./messaging/output.decorator";
export * from "./messaging/app-message";
export * from "./messaging/http-output";

export class Pinecone {
  static configure(configs: Partial<Record<ConfigKey, any>>): void {
    for (const [key, value] of Object.entries(configs)) {
      setConfig(key as ConfigKey, value);
    }
  }

  static hook(key: ConfigKey, callback: (...args: any[]) => void): void {
    setConfig(key, callback);
  }

  static getConfigs(): Record<ConfigKey, any> {
    return getConfigs();
  }
}
