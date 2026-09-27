# Certification Runtime Architecture

Status: approved implementation direction

## Decision

Use the existing Dtf420 Next.js Node runtime with Hostinger-managed **MySQL** as the authoritative persistence layer for authenticated learner progress, assessment attempts, grading results, credentials, and verification.

Preferred stack:
- Better Auth for learner identity, sessions, and authorization.
- Drizzle ORM using the mysql2 driver for typed MySQL access.
- Zod for API/input/result validation at trust boundaries.
- pdf-lib for server-generated certificate PDFs.
- Nano ID or an equivalent cryptographically strong public identifier for credential verification IDs.

This subsystem must remain separate from the public static course content. Reading lessons does not require an account unless a protected learner action specifically needs identity.

## Why MySQL

The current production target is Hostinger managed Node/web hosting. Hostinger provides managed MySQL directly on this hosting model. PostgreSQL would require an external database provider or VPS and is therefore not the default dependency for the first certification runtime.

Use a pooled application connection for normal queries. Run schema migrations through a controlled single migration connection/process.

## Environment contract

Production secrets must never be committed.

Required runtime variables:

- DATABASE_URL
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL=https://dtfseeds.com
- CERTIFICATE_VERIFY_ORIGIN=https://dtfseeds.com

The application should fail closed if credential/assessment routes are invoked without required server configuration. Public education pages must remain available.

## Data ownership

Better Auth owns its generated authentication/session/account tables.

DTF owns the education/certification domain tables below.

### learner_profiles

One record per authenticated learner.

Required fields:
- id
- auth_user_id (unique foreign reference to Better Auth user)
- display_name
- created_at
- updated_at

Do not duplicate passwords, session tokens, or authentication secrets in this table.

### course_progress

Required fields:
- id
- learner_id
- course_id
- course_version
- started_at
- last_activity_at
- completed_at nullable
- percent_complete
- status

Unique constraint:
- learner_id + course_id + course_version

### assessment_versions

Immutable published assessment definitions.

Required fields:
- id
- assessment_key
- version
- course_id
- title
- duration_seconds
- passing_score_percent
- question_pool_hash
- published_at
- retired_at nullable

Once attempts exist against a version, do not mutate grading rules in place. Publish a new version.

### assessment_attempts

Required fields:
- id
- public_reference_id
- learner_id
- assessment_version_id
- started_at_server
- expires_at_server
- submitted_at nullable
- status
- seed_or_form_reference
- last_saved_at
- client_started_at optional diagnostic field

The server clock is authoritative. Client timers are presentation only.

### assessment_answers

Required fields:
- id
- attempt_id
- question_id
- selected_option_id
- saved_at
- revision

Unique constraint:
- attempt_id + question_id

The browser never receives the correct-answer key for active summative attempts.

### assessment_results

Immutable grading outcome.

Required fields:
- id
- attempt_id unique
- raw_score
- percent_score
- passing_score_percent
- passed
- graded_at
- grader_version
- result_hash

### credentials

Required fields:
- id
- public_credential_id unique
- learner_id
- credential_key
- credential_version
- title
- issued_at
- expires_at nullable
- status
- source_result_id
- revoked_at nullable
- revocation_reason nullable
- certificate_artifact_version

Credential status values:
- valid
- revoked
- expired where applicable

### credential_verification_events

Minimal audit record for verification lookups where operationally justified.

Do not store unnecessary identifying information about public visitors.

## Assessment state machine

Allowed states:

created -> active -> submitted -> graded

Exceptional terminal states:
- expired
- abandoned
- invalidated

Rules:
1. Starting an attempt creates the authoritative server timestamps.
2. Selections may be saved only while active and before expiry.
3. Submission is idempotent.
4. Submission locks answer mutation.
5. Grading occurs server-side from the immutable assessment version.
6. Result creation is idempotent and immutable.
7. Credential issuance may run only from a passing result plus any additional credential gates.
8. A credential record exists before a PDF certificate is generated.

## API boundary

Initial server routes should be versioned under a dedicated namespace, for example:

- POST /api/learning/v1/attempts
- GET /api/learning/v1/attempts/:id
- PUT /api/learning/v1/attempts/:id/answers/:questionId
- POST /api/learning/v1/attempts/:id/submit
- GET /api/learning/v1/results/:id
- GET /api/learning/v1/progress
- GET /api/credentials/v1/:publicCredentialId
- GET /verify/:publicCredentialId

All mutation inputs require Zod validation and authenticated authorization.

## Grading rules

- Never trust client-calculated score values.
- Never expose summative answer keys before grading.
- Grade against the exact immutable assessment version referenced by the attempt.
- Record grader version/hash so results remain explainable after future code changes.
- Randomization must be reproducible from a stored form/seed reference.
- Time expiry must be enforced on the server.

## Credential verification

The public verification page may expose only what is required to verify the credential:

- current status
- credential title
- issue date
- expiration date if any
- public credential ID
- learner display name or privacy-preserving approved form

Do not expose email address, account ID, assessment answers, raw attempt history, or private learner profile data.

Certificate QR codes point to the canonical verification URL only. A QR code is not proof by itself.

## Certificate generation

Generate certificate PDFs server-side from the credential record.

The PDF should contain:
- DTF / Teaching Healthy Cultivation branding
- learner display name
- credential title
- issue date
- public credential ID
- QR code to canonical verification page
- verification URL in readable text

The database credential record is authoritative. The PDF is reproducible output.

## Required deterministic QA

Before credential issuance is enabled:

- schema/migration validation
- auth-required route tests
- authorization tests across two distinct users
- server-clock expiry tests
- answer persistence/idempotency tests
- locked-submission tests
- grading fixture tests
- immutable assessment-version tests
- credential issuance idempotency tests
- revocation verification tests
- certificate generation fixture test
- no-answer-key client bundle check
- environment/secrets check

Do not use Playwright as the routine production validation path.

## Delivery phases

### Phase 1 — foundation
- add pinned Better Auth, Drizzle, mysql2, Zod dependencies
- generate Better Auth MySQL schema
- add DTF domain schema and migrations
- add database health/config validation

### Phase 2 — learner progress
- authenticated learner profile
- course progress persistence
- resume/continue state

### Phase 3 — assessment engine
- versioned assessment records
- attempt lifecycle
- saved selections
- server timer
- submission lock
- server grading

### Phase 4 — credentials
- issuance rules
- credential records
- public verification route
- revocation
- PDF generation and QR verification URL

### Phase 5 — production enablement
- migration backup/rollback
- staging with production-equivalent MySQL
- security/authorization review
- end-to-end deterministic fixtures
- enable issuance only after all gates pass
