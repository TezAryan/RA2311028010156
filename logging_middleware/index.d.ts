export type Stack = "backend" | "frontend";
export type Level = "info" | "warn" | "error" | "fatal";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
export type BackendPackage = "cache" | "controller" | "cron job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "auth" | "config" | "middleware" | "utils";
export type Package = FrontendPackage | BackendPackage;
export declare function setTokenProvider(provider: () => Promise<string | undefined>): void;
export declare function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<void>;
