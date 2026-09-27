import "server-only";

import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getLearningDb } from "../db/client";
import { requireLearningRuntime } from "../runtime-config";
import { authSchema } from "./schema";

function buildLearningAuth() {
  requireLearningRuntime();

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
    database: drizzleAdapter(getLearningDb(), {
      provider: "mysql",
      schema: authSchema,
    }),
    trustedOrigins: [
      process.env.BETTER_AUTH_URL!,
      process.env.CERTIFICATE_VERIFY_ORIGIN!,
    ],
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

let authInstance: ReturnType<typeof buildLearningAuth> | undefined;

export function getLearningAuth(): ReturnType<typeof buildLearningAuth> {
  if (!authInstance) authInstance = buildLearningAuth();
  return authInstance;
}
