import { Log as BaseLog, Level, FrontendPackage } from 'logging-middleware';

export const log = (level: Level, pkg: FrontendPackage, message: string) => {
  // Fire and forget log, catching any local errors so it doesn't break UI
  BaseLog("frontend", level, pkg, message).catch((err: any) => console.error("Logging failed:", err));
};
