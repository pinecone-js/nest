import { getCurrentConfig, setConfig } from "./config";

export * from "./messaging/input.decorator";
export * from "./messaging/output.decorator";
export * from "./messaging/app-message";
export * from "./messaging/http-output";

export class Pinecone {
  static config(configs: Record<string, any>): void {
    for (const [key, value] of Object.entries(configs)) {
      setConfig(key, value);
    }
  }

  static getCurrentConfig(): Record<string, any> {
    return getCurrentConfig();
  }
}
