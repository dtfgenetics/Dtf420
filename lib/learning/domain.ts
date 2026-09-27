export type CourseProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "archived";

export type AssessmentAttemptStatus =
  | "created"
  | "active"
  | "submitted"
  | "graded"
  | "expired"
  | "abandoned"
  | "invalidated";

export type CredentialStatus = "valid" | "revoked" | "expired";

export type LearnerProfileRecord = {
  id: string;
  authUserId: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseProgressRecord = {
  id: string;
  learnerId: string;
  courseId: string;
  courseVersion: string;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
  percentComplete: number;
  status: CourseProgressStatus;
};

export type AssessmentVersionRecord = {
  id: string;
  assessmentKey: string;
  version: string;
  courseId: string;
  title: string;
  durationSeconds: number;
  passingScorePercent: number;
  questionPoolHash: string;
  publishedAt: Date;
  retiredAt: Date | null;
};

export type AssessmentAttemptRecord = {
  id: string;
  publicReferenceId: string;
  learnerId: string;
  assessmentVersionId: string;
  startedAtServer: Date;
  expiresAtServer: Date;
  submittedAt: Date | null;
  status: AssessmentAttemptStatus;
  seedOrFormReference: string;
  lastSavedAt: Date;
  clientStartedAt: Date | null;
};

export type AssessmentAnswerRecord = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  savedAt: Date;
  revision: number;
};

export type AssessmentResultRecord = {
  id: string;
  attemptId: string;
  rawScore: number;
  percentScore: number;
  passingScorePercent: number;
  passed: boolean;
  gradedAt: Date;
  graderVersion: string;
  resultHash: string;
};

export type CredentialRecord = {
  id: string;
  publicCredentialId: string;
  learnerId: string;
  credentialKey: string;
  credentialVersion: string;
  title: string;
  issuedAt: Date;
  expiresAt: Date | null;
  status: CredentialStatus;
  sourceResultId: string;
  revokedAt: Date | null;
  revocationReason: string | null;
  certificateArtifactVersion: string;
};

export type CredentialVerificationEventRecord = {
  id: string;
  credentialId: string;
  verifiedAt: Date;
  resultStatus: CredentialStatus | "not-found";
  requestFingerprintHash: string | null;
};
