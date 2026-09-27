import "server-only";

import { and, eq } from "drizzle-orm";
import type {
  CourseProgressRecord,
  LearnerProfileRecord,
} from "../domain";
import { getLearningDb } from "./client";
import { courseProgress, learnerProfiles } from "./schema";

function mapLearner(row: typeof learnerProfiles.$inferSelect): LearnerProfileRecord {
  return {
    id: row.id,
    authUserId: row.authUserId,
    displayName: row.displayName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapProgress(row: typeof courseProgress.$inferSelect): CourseProgressRecord {
  return {
    id: row.id,
    learnerId: row.learnerId,
    courseId: row.courseId,
    courseVersion: row.courseVersion,
    startedAt: row.startedAt,
    lastActivityAt: row.lastActivityAt,
    completedAt: row.completedAt,
    percentComplete: Number(row.percentComplete),
    status: row.status as CourseProgressRecord["status"],
  };
}

export async function findLearnerByAuthUserId(
  authUserId: string,
): Promise<LearnerProfileRecord | null> {
  const db = getLearningDb();
  const rows = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.authUserId, authUserId))
    .limit(1);

  return rows[0] ? mapLearner(rows[0]) : null;
}

export async function createLearnerProfile(
  record: LearnerProfileRecord,
): Promise<LearnerProfileRecord> {
  const db = getLearningDb();
  await db.insert(learnerProfiles).values({
    id: record.id,
    authUserId: record.authUserId,
    displayName: record.displayName,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });

  const created = await findLearnerByAuthUserId(record.authUserId);
  if (!created) throw new Error("Learner profile insert did not produce a readable record.");
  return created;
}

export async function getCourseProgress(
  learnerId: string,
  courseId: string,
  courseVersion: string,
): Promise<CourseProgressRecord | null> {
  const db = getLearningDb();
  const rows = await db
    .select()
    .from(courseProgress)
    .where(
      and(
        eq(courseProgress.learnerId, learnerId),
        eq(courseProgress.courseId, courseId),
        eq(courseProgress.courseVersion, courseVersion),
      ),
    )
    .limit(1);

  return rows[0] ? mapProgress(rows[0]) : null;
}

export async function upsertCourseProgress(
  record: CourseProgressRecord,
): Promise<CourseProgressRecord> {
  if (!Number.isFinite(record.percentComplete) || record.percentComplete < 0 || record.percentComplete > 100) {
    throw new RangeError("percentComplete must be between 0 and 100.");
  }

  const db = getLearningDb();
  await db
    .insert(courseProgress)
    .values({
      id: record.id,
      learnerId: record.learnerId,
      courseId: record.courseId,
      courseVersion: record.courseVersion,
      startedAt: record.startedAt,
      lastActivityAt: record.lastActivityAt,
      completedAt: record.completedAt,
      percentComplete: record.percentComplete.toFixed(2),
      status: record.status,
    })
    .onDuplicateKeyUpdate({
      set: {
        lastActivityAt: record.lastActivityAt,
        completedAt: record.completedAt,
        percentComplete: record.percentComplete.toFixed(2),
        status: record.status,
      },
    });

  const saved = await getCourseProgress(
    record.learnerId,
    record.courseId,
    record.courseVersion,
  );
  if (!saved) throw new Error("Course progress upsert did not produce a readable record.");
  return saved;
}
