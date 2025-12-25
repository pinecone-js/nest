const configKeys = ["debug"] as const;
const registerKeys = ["usecase.error.report", "usecase.logging"] as const;

export type ConfigKey = (typeof configKeys)[number];
export type RegisterKey = (typeof registerKeys)[number];

const config: Record<ConfigKey, any> = {
  debug: false,
};

type Handler = (...args: any[]) => void;

const register: Record<RegisterKey, Handler[] | null> = {
  "usecase.error.report": [],
  "usecase.logging": [],
};

export function setConfig(key: ConfigKey, value: any): void {
  config[key] = value;
}

export function getConfig<T>(key: ConfigKey, defaultValue?: T): T {
  return (config[key] ?? defaultValue) as T;
}

export function addHandler(key: RegisterKey, handler: Handler): void {
  if (!register[key]) register[key] = [];
  register[key].push(handler);
}

export function getConfigs(): Record<ConfigKey, any> {
  return config;
}

export function getHandlers(key: RegisterKey): Handler[] {
  return register[key] ?? [];
}
