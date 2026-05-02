import axios from 'axios';

export type Stack = "backend" | "frontend";
export type Level = "info" | "warn" | "error" | "fatal";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
export type BackendPackage = "cache" | "controller" | "cron job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "auth" | "config" | "middleware" | "utils";

export type Package = FrontendPackage | BackendPackage;

let tokenProvider: (() => Promise<string | undefined>) | null = null;

export function setTokenProvider(provider: () => Promise<string | undefined>) {
  tokenProvider = provider;
}

const VALID_STACKS = new Set(["backend", "frontend"]);
const VALID_LEVELS = new Set(["info", "warn", "error", "fatal"]);
const VALID_FRONTEND_PACKAGES = new Set(["api", "component", "hook", "page", "state", "style", "auth", "config", "middleware", "utils"]);
const VALID_BACKEND_PACKAGES = new Set(["cache", "controller", "cron job", "db", "domain", "handler", "repository", "route", "service", "auth", "config", "middleware", "utils"]);

export async function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<void> {
  // Input validation
  if (!VALID_STACKS.has(stack)) {
    console.error(`Invalid stack: ${stack}. Must be 'backend' or 'frontend'.`);
    return;
  }

  if (!VALID_LEVELS.has(level)) {
    console.error(`Invalid level: ${level}. Must be 'info', 'warn', 'error', or 'fatal'.`);
    return;
  }

  if (stack === "frontend" && !VALID_FRONTEND_PACKAGES.has(pkg)) {
    console.error(`Invalid package for frontend stack: ${pkg}.`);
    return;
  }

  if (stack === "backend" && !VALID_BACKEND_PACKAGES.has(pkg)) {
    console.error(`Invalid package for backend stack: ${pkg}.`);
    return;
  }

  if (!message || typeof message !== 'string') {
    console.error(`Invalid message: must be a non-empty string.`);
    return;
  }

  let token = process.env.BEARER_TOKEN;
  if (tokenProvider) {
    const freshToken = await tokenProvider();
    if (freshToken) token = freshToken;
  }

  if (!token) {
    console.error('No authorization token available for logging middleware.');
    return;
  }

  const safeMessage = message.length > 48 ? message.substring(0, 48) : message;

  try {
    await axios.post('http://20.207.122.201/evaluation-service/logs', {
      stack,
      level,
      package: pkg,
      message: safeMessage
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Failed to send log:', error);
  }
}
