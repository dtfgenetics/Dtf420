import "server-only";

import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getLearningDb } from "../db/client";
import { requireLearningRuntime } from "../runtime-config";
import { authSchema } from "./schema";

let authInstance: ReturnType<typeof betterAuth> | undefined;

export function getLearningAuth() {
  requireLearningRuntime();

  if (!authInstance) {
    authInstance = betterAuth({
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL: process.env.BETTER_AUTH_URL!,
      database: drizzleAdapter(getLearningDb(), {
        provider: "mysql",
        schema: authSchema,
      }),
      trustedOrigins: [process.env.BETTER_AUTH_URL!],
      emailAndPassword: {
        enabled: false,
      },
      advanced: {
        database: {
          joins: false,
        },
      },
    });
  }

  return authInstance;
}
