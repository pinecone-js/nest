const configKeys = ["debug", "hook.output.report"] as const;

type ConfigKey = (typeof configKeys)[number];

const config: Record<ConfigKey, any> = {
  debug: false,
  "hook.output.report": null,
};

export function setConfig(key: ConfigKey, value: any): void {
  config[key] = value;
}

export function getConfig<T>(key: ConfigKey, defaultValue?: T): T {
  return (config[key] ?? defaultValue) as T;
}

export function getCurrentConfig(): Record<ConfigKey, any> {
  return config;
}
