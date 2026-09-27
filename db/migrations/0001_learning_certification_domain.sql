-- DTF / THC learner and certification domain schema
-- Better Auth owns its own generated auth/session/account tables.
-- This migration intentionally stores auth_user_id as an external unique reference
-- until the Better Auth MySQL schema is generated in the same deployment.

CREATE TABLE learner_profiles (
  id VARCHAR(32) NOT NULL,
  auth_user_id VARCHAR(255) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_learner_profiles_auth_user_id (auth_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE course_progress (
  id VARCHAR(32) NOT NULL,
  learner_id VARCHAR(32) NOT NULL,
  course_id VARCHAR(120) NOT NULL,
  course_version VARCHAR(64) NOT NULL,
  started_at DATETIME(6) NOT NULL,
  last_activity_at DATETIME(6) NOT NULL,
  completed_at DATETIME(6) NULL,
  percent_complete DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_course_progress_learner_course_version (learner_id, course_id, course_version),
  KEY idx_course_progress_learner_status (learner_id, status),
  CONSTRAINT fk_course_progress_learner
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_course_progress_percent
    CHECK (percent_complete >= 0.00 AND percent_complete <= 100.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE assessment_versions (
  id VARCHAR(32) NOT NULL,
  assessment_key VARCHAR(160) NOT NULL,
  version VARCHAR(64) NOT NULL,
  course_id VARCHAR(120) NOT NULL,
  title VARCHAR(240) NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL,
  passing_score_percent DECIMAL(5,2) NOT NULL,
  question_pool_hash CHAR(64) NOT NULL,
  published_at DATETIME(6) NOT NULL,
  retired_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assessment_versions_key_version (assessment_key, version),
  KEY idx_assessment_versions_course (course_id),
  CONSTRAINT chk_assessment_duration CHECK (duration_seconds > 0),
  CONSTRAINT chk_assessment_passing_score
    CHECK (passing_score_percent >= 0.00 AND passing_score_percent <= 100.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE assessment_attempts (
  id VARCHAR(32) NOT NULL,
  public_reference_id VARCHAR(64) NOT NULL,
  learner_id VARCHAR(32) NOT NULL,
  assessment_version_id VARCHAR(32) NOT NULL,
  started_at_server DATETIME(6) NOT NULL,
  expires_at_server DATETIME(6) NOT NULL,
  submitted_at DATETIME(6) NULL,
  status VARCHAR(32) NOT NULL,
  seed_or_form_reference VARCHAR(160) NOT NULL,
  last_saved_at DATETIME(6) NOT NULL,
  client_started_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assessment_attempts_public_reference (public_reference_id),
  KEY idx_assessment_attempts_learner_status (learner_id, status),
  KEY idx_assessment_attempts_assessment (assessment_version_id),
  CONSTRAINT fk_assessment_attempts_learner
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_assessment_attempts_version
    FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_assessment_attempt_time
    CHECK (expires_at_server > started_at_server),
  CONSTRAINT chk_assessment_attempt_status
    CHECK (status IN ('created','active','submitted','graded','expired','abandoned','invalidated'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE assessment_answers (
  id VARCHAR(32) NOT NULL,
  attempt_id VARCHAR(32) NOT NULL,
  question_id VARCHAR(160) NOT NULL,
  selected_option_id VARCHAR(160) NOT NULL,
  saved_at DATETIME(6) NOT NULL,
  revision INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assessment_answers_attempt_question (attempt_id, question_id),
  KEY idx_assessment_answers_attempt (attempt_id),
  CONSTRAINT fk_assessment_answers_attempt
    FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_assessment_answers_revision CHECK (revision > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE assessment_results (
  id VARCHAR(32) NOT NULL,
  attempt_id VARCHAR(32) NOT NULL,
  raw_score DECIMAL(10,4) NOT NULL,
  percent_score DECIMAL(5,2) NOT NULL,
  passing_score_percent DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  graded_at DATETIME(6) NOT NULL,
  grader_version VARCHAR(64) NOT NULL,
  result_hash CHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assessment_results_attempt (attempt_id),
  CONSTRAINT fk_assessment_results_attempt
    FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_assessment_result_percent
    CHECK (percent_score >= 0.00 AND percent_score <= 100.00),
  CONSTRAINT chk_assessment_result_passing
    CHECK (passing_score_percent >= 0.00 AND passing_score_percent <= 100.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE credentials (
  id VARCHAR(32) NOT NULL,
  public_credential_id VARCHAR(64) NOT NULL,
  learner_id VARCHAR(32) NOT NULL,
  credential_key VARCHAR(160) NOT NULL,
  credential_version VARCHAR(64) NOT NULL,
  title VARCHAR(240) NOT NULL,
  issued_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NULL,
  status VARCHAR(32) NOT NULL,
  source_result_id VARCHAR(32) NOT NULL,
  revoked_at DATETIME(6) NULL,
  revocation_reason VARCHAR(500) NULL,
  certificate_artifact_version VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_credentials_public_id (public_credential_id),
  UNIQUE KEY uq_credentials_source_result (source_result_id),
  KEY idx_credentials_learner_status (learner_id, status),
  CONSTRAINT fk_credentials_learner
    FOREIGN KEY (learner_id) REFERENCES learner_profiles(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_credentials_result
    FOREIGN KEY (source_result_id) REFERENCES assessment_results(id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_credentials_status
    CHECK (status IN ('valid','revoked','expired')),
  CONSTRAINT chk_credentials_revocation
    CHECK (
      (status = 'revoked' AND revoked_at IS NOT NULL)
      OR (status <> 'revoked')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE credential_verification_events (
  id VARCHAR(32) NOT NULL,
  credential_id VARCHAR(32) NOT NULL,
  verified_at DATETIME(6) NOT NULL,
  result_status VARCHAR(32) NOT NULL,
  request_fingerprint_hash CHAR(64) NULL,
  PRIMARY KEY (id),
  KEY idx_credential_verification_credential_time (credential_id, verified_at),
  CONSTRAINT fk_credential_verification_credential
    FOREIGN KEY (credential_id) REFERENCES credentials(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
