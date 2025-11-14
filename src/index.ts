import { ConfigKey, getCurrentConfig, setConfig } from "./config";

export * from "./messaging/input.decorator";
export * from "./messaging/output.decorator";
export * from "./messaging/app-message";
export * from "./messaging/http-output";

export class Pinecone {
  static config(configs: Record<ConfigKey, any>): void {
    for (const [key, value] of Object.entries(configs)) {
      setConfig(key as ConfigKey, value);
    }
  }

  static getCurrentConfig(): Record<ConfigKey, any> {
    return getCurrentConfig();
  }
}
