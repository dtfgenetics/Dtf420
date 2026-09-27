import "../server-runtime-only";

import { getLearningAuth } from "./server";

export class LearningAuthenticationRequiredError extends Error {
  readonly code = "LEARNING_AUTHENTICATION_REQUIRED";

  constructor() {
    super("Authentication is required for this learning action.");
    this.name = "LearningAuthenticationRequiredError";
  }
}

export async function getLearningSession(requestHeaders: Headers) {
  return getLearningAuth().api.getSession({
    headers: requestHeaders,
  });
}

export async function requireLearningUser(requestHeaders: Headers) {
  const session = await getLearningSession(requestHeaders);
  if (!session?.user) throw new LearningAuthenticationRequiredError();
  return session.user;
}
