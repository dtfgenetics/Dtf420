import type {
  AssessmentAnswerRecord,
  AssessmentAttemptRecord,
  AssessmentResultRecord,
  AssessmentVersionRecord,
  CourseProgressRecord,
  CredentialRecord,
  CredentialVerificationEventRecord,
  LearnerProfileRecord,
} from "./domain";

export type StartAssessmentAttemptInput = {
  learnerId: string;
  assessmentVersionId: string;
  publicReferenceId: string;
  seedOrFormReference: string;
  startedAtServer: Date;
  expiresAtServer: Date;
};

export type SaveAssessmentAnswerInput = {
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  savedAt: Date;
};

export type CreateAssessmentResultInput = Omit<
  AssessmentResultRecord,
  "id"
>;

export type IssueCredentialInput = Omit<
  CredentialRecord,
  "id" | "status" | "revokedAt" | "revocationReason"
>;

export interface LearningPersistence {
  findLearnerByAuthUserId(authUserId: string): Promise<LearnerProfileRecord | null>;
  createLearner(profile: LearnerProfileRecord): Promise<LearnerProfileRecord>;

  getCourseProgress(
    learnerId: string,
    courseId: string,
    courseVersion: string,
  ): Promise<CourseProgressRecord | null>;
  upsertCourseProgress(progress: CourseProgressRecord): Promise<CourseProgressRecord>;

  getAssessmentVersion(id: string): Promise<AssessmentVersionRecord | null>;
  startAssessmentAttempt(
    input: StartAssessmentAttemptInput,
  ): Promise<AssessmentAttemptRecord>;
  getAssessmentAttempt(id: string): Promise<AssessmentAttemptRecord | null>;
  listAssessmentAnswers(attemptId: string): Promise<AssessmentAnswerRecord[]>;
  saveAssessmentAnswer(
    input: SaveAssessmentAnswerInput,
  ): Promise<AssessmentAnswerRecord>;
  submitAssessmentAttempt(
    attemptId: string,
    submittedAt: Date,
  ): Promise<AssessmentAttemptRecord>;
  createAssessmentResult(
    input: CreateAssessmentResultInput,
  ): Promise<AssessmentResultRecord>;
  getAssessmentResultByAttempt(
    attemptId: string,
  ): Promise<AssessmentResultRecord | null>;

  issueCredential(input: IssueCredentialInput): Promise<CredentialRecord>;
  getCredentialByPublicId(publicCredentialId: string): Promise<CredentialRecord | null>;
  revokeCredential(
    publicCredentialId: string,
    revokedAt: Date,
    reason: string,
  ): Promise<CredentialRecord>;
  recordCredentialVerification(
    event: CredentialVerificationEventRecord,
  ): Promise<void>;
}
