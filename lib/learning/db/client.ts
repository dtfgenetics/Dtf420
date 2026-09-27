import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2/promise";
import { requireLearningRuntime } from "../runtime-config";
import { learningSchema } from "./schema";

let pool: Pool | undefined;

function getPool(): Pool {
  requireLearningRuntime();

  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  return pool;
}

export function getLearningDb() {
  return drizzle({
    client: getPool(),
    schema: learningSchema,
  });
}

export async function closeLearningDbPoolForTests(): Promise<void> {
  if (!pool) return;
  const current = pool;
  pool = undefined;
  await current.end();
}
