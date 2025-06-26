/**
 * Environment Configuration
 * Centralized environment variables with validation
 */

import { z } from "zod";

// Environment schema for validation
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform(Number).default("30000"),
  NEXT_PUBLIC_USE_API: z.string().transform((val) => val === "true").default("true"),
  NEXT_PUBLIC_APP_VERSION: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_API_ACCOUNT: z.string().optional(),
  NEXT_PUBLIC_API_USER: z.string().optional(),
  NEXT_PUBLIC_API_TRAINEE: z.string().optional(),
  NEXT_PUBLIC_API_LOGIN: z.string().optional(),
  NEXT_PUBLIC_API_REGISTER: z.string().optional(),
  NEXT_PUBLIC_API_LOGOUT: z.string().optional(),
  NEXT_PUBLIC_API_GET_ME: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

// Parse and validate environment variables
function parseEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_USE_API: process.env.NEXT_PUBLIC_USE_API,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_ACCOUNT: process.env.NEXT_PUBLIC_API_ACCOUNT,
    NEXT_PUBLIC_API_USER: process.env.NEXT_PUBLIC_API_USER,
    NEXT_PUBLIC_API_TRAINEE: process.env.NEXT_PUBLIC_API_TRAINEE,
    NEXT_PUBLIC_API_LOGIN: process.env.NEXT_PUBLIC_API_LOGIN,
    NEXT_PUBLIC_API_REGISTER: process.env.NEXT_PUBLIC_API_REGISTER,
    NEXT_PUBLIC_API_LOGOUT: process.env.NEXT_PUBLIC_API_LOGOUT,
    NEXT_PUBLIC_API_GET_ME: process.env.NEXT_PUBLIC_API_GET_ME,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Invalid environment configuration");
  }
}

// Export validated environment
export const env = parseEnv();

// Export environment helpers
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Log environment info in development
if (isDev && typeof window !== "undefined") {
  console.log("🌍 Environment Configuration:", {
    nodeEnv: env.NODE_ENV,
    apiUrl: env.NEXT_PUBLIC_API_URL,
    useApi: env.NEXT_PUBLIC_USE_API,
    version: env.NEXT_PUBLIC_APP_VERSION,
    appName: env.NEXT_PUBLIC_APP_NAME,
  });
}
