import { ConfigKey, getConfigs, setConfig } from "./config";

export * from "./messaging/input.decorator";
export * from "./messaging/output.decorator";
export * from "./messaging/app-message";
export * from "./messaging/http-output";

export class Pinecone {
  static configure(configs: Record<ConfigKey, any>): void {
    for (const [key, value] of Object.entries(configs)) {
      setConfig(key as ConfigKey, value);
    }
  }

  static getConfigs(): Record<ConfigKey, any> {
    return getConfigs();
  }
}
