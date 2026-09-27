const REQUIRED_PROTECTED_ENV = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "CERTIFICATE_VERIFY_ORIGIN",
] as const;

export type ProtectedLearningEnvName = (typeof REQUIRED_PROTECTED_ENV)[number];

export type LearningRuntimeStatus =
  | { ready: true; missing: []; canonical: true }
  | { ready: false; missing: ProtectedLearningEnvName[]; canonical: boolean };

const CANONICAL_AUTH_ORIGIN = "https://learn-api.dtfseeds.com";
const CANONICAL_PUBLIC_ORIGIN = "https://dtfseeds.com";

function clean(value: string | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export function getLearningRuntimeStatus(
  env: NodeJS.ProcessEnv = process.env,
): LearningRuntimeStatus {
  const missing = REQUIRED_PROTECTED_ENV.filter((name) => !clean(env[name]));

  const authUrl = clean(env.BETTER_AUTH_URL);
  const verifyOrigin = clean(env.CERTIFICATE_VERIFY_ORIGIN);
  const canonical =
    (!authUrl || authUrl === CANONICAL_AUTH_ORIGIN) &&
    (!verifyOrigin || verifyOrigin === CANONICAL_PUBLIC_ORIGIN);

  if (missing.length === 0 && canonical) {
    return { ready: true, missing: [], canonical: true };
  }

  return {
    ready: false,
    missing: [...missing],
    canonical,
  };
}

export class LearningRuntimeUnavailableError extends Error {
  readonly code = "LEARNING_RUNTIME_UNAVAILABLE";

  constructor(
    public readonly status: Exclude<LearningRuntimeStatus, { ready: true }>,
  ) {
    super("Authenticated learning runtime is not fully configured.");
    this.name = "LearningRuntimeUnavailableError";
  }
}

export function requireLearningRuntime(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const status = getLearningRuntimeStatus(env);
  if (!status.ready) throw new LearningRuntimeUnavailableError(status);
}

export const learningRuntimeContract = {
  requiredEnv: REQUIRED_PROTECTED_ENV,
  canonicalAuthOrigin: CANONICAL_AUTH_ORIGIN,
  canonicalPublicOrigin: CANONICAL_PUBLIC_ORIGIN,
} as const;
