const settingKeys = ["debug", "logExceptionAsString"] as const;
const registerKeys = ["usecase.error.report", "usecase.logging"] as const;

export type SettingKey = (typeof settingKeys)[number];
export type RegisterKey = (typeof registerKeys)[number];

const settings: Record<SettingKey, any> = {
  debug: false,
  logExceptionAsString: false,
};


type Handler = (...args: any[]) => void;
const register: Record<RegisterKey, Handler[] | null> = {
  "usecase.error.report": [],
  "usecase.logging": [],
};

export function setSetting(key: SettingKey, value: any): void {
  settings[key] = value;
}

// Settings
export function getSetting<T>(key: SettingKey, defaultValue?: T): T {
  return (settings[key] ?? defaultValue) as T;
}

export function getSettings(): Record<SettingKey, any> {
  return settings;
}

// Handlers
export function addHandler(key: RegisterKey, handler: Handler): void {
  if (!register[key]) register[key] = [];
  register[key].push(handler);
}

export function getHandlers(key: RegisterKey): Handler[] {
  return register[key] ?? [];
}
