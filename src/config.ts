const configKeys = ["debug"] as const;
const hookKeys = ["output.report"] as const;

export type ConfigKey = (typeof configKeys)[number];
export type HookKey = (typeof hookKeys)[number];

const config: Record<ConfigKey, any> = {
  debug: false,
};

type HookHandler = (...args: any[]) => void;

const hooks: Record<HookKey, HookHandler[] | null> = {
  "output.report": [],
};

export function setConfig(key: ConfigKey, value: any): void {
  config[key] = value;
}

export function getConfig<T>(key: ConfigKey, defaultValue?: T): T {
  return (config[key] ?? defaultValue) as T;
}

export function hook(key: HookKey, handler: HookHandler): void {
  hooks[key]?.push(handler);
}

export function getConfigs(): Record<ConfigKey, any> {
  return config;
}

export function getHandlers(key: HookKey): HookHandler[] {
  return hooks[key] ?? [];
}
