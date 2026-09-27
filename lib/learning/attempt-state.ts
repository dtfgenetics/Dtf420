import type { AssessmentAttemptStatus } from "./domain";

const transitions: Record<AssessmentAttemptStatus, ReadonlySet<AssessmentAttemptStatus>> = {
  created: new Set(["active", "abandoned", "invalidated"]),
  active: new Set(["submitted", "expired", "abandoned", "invalidated"]),
  submitted: new Set(["graded", "invalidated"]),
  graded: new Set(),
  expired: new Set(),
  abandoned: new Set(),
  invalidated: new Set(),
};

export function canTransitionAssessmentAttempt(
  from: AssessmentAttemptStatus,
  to: AssessmentAttemptStatus,
): boolean {
  return transitions[from].has(to);
}

export function assertAssessmentAttemptTransition(
  from: AssessmentAttemptStatus,
  to: AssessmentAttemptStatus,
): void {
  if (!canTransitionAssessmentAttempt(from, to)) {
    throw new Error(`Invalid assessment attempt transition: ${from} -> ${to}`);
  }
}

export function isAssessmentAttemptMutable(status: AssessmentAttemptStatus): boolean {
  return status === "created" || status === "active";
}

export function isAssessmentAttemptTerminal(status: AssessmentAttemptStatus): boolean {
  return transitions[status].size === 0;
}
