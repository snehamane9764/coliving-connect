import type { Pool, PoolClient } from "pg";
import type { Profile } from "./types.js";

type Queryable = Pick<Pool | PoolClient, "query">;

const profileColumns = `
  id, name, email, age, occupation, bio, city,
  move_in_date AS "moveInDate",
  budget_min AS "budgetMin",
  budget_max AS "budgetMax",
  avatar_url AS "avatarUrl",
  interests,
  sleep_schedule AS "sleepSchedule",
  cleanliness,
  social_level AS "socialLevel",
  noise_tolerance AS "noiseTolerance",
  guest_frequency AS "guestFrequency",
  smoking, pets,
  work_from_home AS "workFromHome"
`;

export async function findProfile(db: Queryable, id: string): Promise<Profile | null> {
  const result = await db.query<Profile>(`SELECT ${profileColumns} FROM users WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function findCandidates(
  db: Queryable,
  current: Profile,
  filters: { maxBudget?: number; interests?: string[] },
): Promise<Profile[]> {
  const values: unknown[] = [current.id, current.city];
  const clauses = ["id <> $1", "LOWER(city) = LOWER($2)"];

  if (filters.maxBudget !== undefined) {
    values.push(filters.maxBudget);
    clauses.push(`budget_min <= $${values.length}`);
  }
  if (filters.interests?.length) {
    values.push(filters.interests);
    clauses.push(`interests && $${values.length}::text[]`);
  }

  values.push(current.id);
  clauses.push(`NOT EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = $${values.length} AND swiped_id = users.id
  )`);

  const result = await db.query<Profile>(
    `SELECT ${profileColumns} FROM users WHERE ${clauses.join(" AND ")}`,
    values,
  );
  return result.rows;
}
