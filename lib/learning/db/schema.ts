import {
  boolean,
  datetime,
  decimal,
  index,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const learnerProfiles = mysqlTable(
  "learner_profiles",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    authUserId: varchar("auth_user_id", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    createdAt: datetime("created_at", { mode: "date", fsp: 6 }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date", fsp: 6 }).notNull(),
  },
  (table) => [
    uniqueIndex("uq_learner_profiles_auth_user_id").on(table.authUserId),
  ],
);

export const courseProgress = mysqlTable(
  "course_progress",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    learnerId: varchar("learner_id", { length: 32 }).notNull(),
    courseId: varchar("course_id", { length: 120 }).notNull(),
    courseVersion: varchar("course_version", { length: 64 }).notNull(),
    startedAt: datetime("started_at", { mode: "date", fsp: 6 }).notNull(),
    lastActivityAt: datetime("last_activity_at", { mode: "date", fsp: 6 }).notNull(),
    completedAt: datetime("completed_at", { mode: "date", fsp: 6 }),
    percentComplete: decimal("percent_complete", { precision: 5, scale: 2 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
  },
  (table) => [
    uniqueIndex("uq_course_progress_learner_course_version").on(
      table.learnerId,
      table.courseId,
      table.courseVersion,
    ),
    index("idx_course_progress_learner_status").on(table.learnerId, table.status),
  ],
);

export const assessmentVersions = mysqlTable(
  "assessment_versions",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    assessmentKey: varchar("assessment_key", { length: 160 }).notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    courseId: varchar("course_id", { length: 120 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    durationSeconds: int("duration_seconds", { unsigned: true }).notNull(),
    passingScorePercent: decimal("passing_score_percent", {
      precision: 5,
      scale: 2,
    }).notNull(),
    questionPoolHash: varchar("question_pool_hash", { length: 64 }).notNull(),
    publishedAt: datetime("published_at", { mode: "date", fsp: 6 }).notNull(),
    retiredAt: datetime("retired_at", { mode: "date", fsp: 6 }),
  },
  (table) => [
    uniqueIndex("uq_assessment_versions_key_version").on(
      table.assessmentKey,
      table.version,
    ),
    index("idx_assessment_versions_course").on(table.courseId),
  ],
);

export const assessmentAttempts = mysqlTable(
  "assessment_attempts",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    publicReferenceId: varchar("public_reference_id", { length: 64 }).notNull(),
    learnerId: varchar("learner_id", { length: 32 }).notNull(),
    assessmentVersionId: varchar("assessment_version_id", { length: 32 }).notNull(),
    startedAtServer: datetime("started_at_server", { mode: "date", fsp: 6 }).notNull(),
    expiresAtServer: datetime("expires_at_server", { mode: "date", fsp: 6 }).notNull(),
    submittedAt: datetime("submitted_at", { mode: "date", fsp: 6 }),
    status: varchar("status", { length: 32 }).notNull(),
    seedOrFormReference: varchar("seed_or_form_reference", { length: 160 }).notNull(),
    lastSavedAt: datetime("last_saved_at", { mode: "date", fsp: 6 }).notNull(),
    clientStartedAt: datetime("client_started_at", { mode: "date", fsp: 6 }),
  },
  (table) => [
    uniqueIndex("uq_assessment_attempts_public_reference").on(table.publicReferenceId),
    index("idx_assessment_attempts_learner_status").on(table.learnerId, table.status),
    index("idx_assessment_attempts_assessment").on(table.assessmentVersionId),
  ],
);

export const assessmentAnswers = mysqlTable(
  "assessment_answers",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 32 }).notNull(),
    questionId: varchar("question_id", { length: 160 }).notNull(),
    selectedOptionId: varchar("selected_option_id", { length: 160 }).notNull(),
    savedAt: datetime("saved_at", { mode: "date", fsp: 6 }).notNull(),
    revision: int("revision", { unsigned: true }).notNull(),
  },
  (table) => [
    uniqueIndex("uq_assessment_answers_attempt_question").on(
      table.attemptId,
      table.questionId,
    ),
    index("idx_assessment_answers_attempt").on(table.attemptId),
  ],
);

export const assessmentResults = mysqlTable(
  "assessment_results",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 32 }).notNull(),
    rawScore: decimal("raw_score", { precision: 10, scale: 4 }).notNull(),
    percentScore: decimal("percent_score", { precision: 5, scale: 2 }).notNull(),
    passingScorePercent: decimal("passing_score_percent", {
      precision: 5,
      scale: 2,
    }).notNull(),
    passed: boolean("passed").notNull(),
    gradedAt: datetime("graded_at", { mode: "date", fsp: 6 }).notNull(),
    graderVersion: varchar("grader_version", { length: 64 }).notNull(),
    resultHash: varchar("result_hash", { length: 64 }).notNull(),
  },
  (table) => [
    uniqueIndex("uq_assessment_results_attempt").on(table.attemptId),
  ],
);

export const credentials = mysqlTable(
  "credentials",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    publicCredentialId: varchar("public_credential_id", { length: 64 }).notNull(),
    learnerId: varchar("learner_id", { length: 32 }).notNull(),
    credentialKey: varchar("credential_key", { length: 160 }).notNull(),
    credentialVersion: varchar("credential_version", { length: 64 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    issuedAt: datetime("issued_at", { mode: "date", fsp: 6 }).notNull(),
    expiresAt: datetime("expires_at", { mode: "date", fsp: 6 }),
    status: varchar("status", { length: 32 }).notNull(),
    sourceResultId: varchar("source_result_id", { length: 32 }).notNull(),
    revokedAt: datetime("revoked_at", { mode: "date", fsp: 6 }),
    revocationReason: varchar("revocation_reason", { length: 500 }),
    certificateArtifactVersion: varchar("certificate_artifact_version", {
      length: 64,
    }).notNull(),
  },
  (table) => [
    uniqueIndex("uq_credentials_public_id").on(table.publicCredentialId),
    uniqueIndex("uq_credentials_source_result").on(table.sourceResultId),
    index("idx_credentials_learner_status").on(table.learnerId, table.status),
  ],
);

export const credentialVerificationEvents = mysqlTable(
  "credential_verification_events",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    credentialId: varchar("credential_id", { length: 32 }).notNull(),
    verifiedAt: datetime("verified_at", { mode: "date", fsp: 6 }).notNull(),
    resultStatus: varchar("result_status", { length: 32 }).notNull(),
    requestFingerprintHash: varchar("request_fingerprint_hash", { length: 64 }),
  },
  (table) => [
    index("idx_credential_verification_credential_time").on(
      table.credentialId,
      table.verifiedAt,
    ),
  ],
);

export const learningSchema = {
  learnerProfiles,
  courseProgress,
  assessmentVersions,
  assessmentAttempts,
  assessmentAnswers,
  assessmentResults,
  credentials,
  credentialVerificationEvents,
};
