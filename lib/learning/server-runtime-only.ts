if (typeof window !== "undefined") {
  throw new Error("Learning server runtime code cannot execute in a browser.");
}

export const learningServerRuntimeOnly = true as const;
