import cors from "cors";
import express from "express";
import type { Pool } from "pg";
import { z } from "zod";
import { findCandidates, findProfile } from "./profileRepository.js";
import { scoreCandidates } from "./recommendationClient.js";

const uuid = z.string().uuid();
const swipeSchema = z.object({
  swiperId: uuid,
  swipedId: uuid,
  decision: z.enum(["like", "pass"]),
  compatibilityScore: z.number().min(0).max(100).optional(),
});

const preferenceSchema = z.object({
  city: z.string().trim().min(2).max(100),
  moveInDate: z.string().date(),
  maxBudget: z.number().int().min(500).max(10_000),
  interests: z.array(z.string().trim().min(1)).min(1).max(12),
  sleepSchedule: z.number().int().min(1).max(5),
  cleanliness: z.number().int().min(1).max(5),
  socialLevel: z.number().int().min(1).max(5),
  noiseTolerance: z.number().int().min(1).max(5),
  guestFrequency: z.number().int().min(1).max(5),
  smoking: z.boolean(),
  pets: z.boolean(),
  workFromHome: z.boolean(),
});

export function createApp(db: Pool) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/api/health", async (_request, response, next) => {
    try {
      await db.query("SELECT 1");
      response.json({ status: "ok", services: { api: "up", database: "up" } });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id", async (request, response, next) => {
    try {
      const id = uuid.parse(request.params.id);
      const profile = await findProfile(db, id);
      if (!profile) return response.status(404).json({ error: "Profile not found" });
      response.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/recommendations/:userId", async (request, response, next) => {
    try {
      const userId = uuid.parse(request.params.userId);
      const query = z.object({
        maxBudget: z.coerce.number().positive().optional(),
        interests: z.string().optional(),
      }).parse(request.query);

      const current = await findProfile(db, userId);
      if (!current) return response.status(404).json({ error: "Profile not found" });

      const candidates = await findCandidates(db, current, {
        maxBudget: query.maxBudget,
        interests: query.interests?.split(",").filter(Boolean),
      });
      const scores = await scoreCandidates(current, candidates);
      const profileById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
      response.json(scores.map((score) => ({ ...score, profile: profileById.get(score.userId) })));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/recommendations/:userId/preview", async (request, response, next) => {
    try {
      const userId = uuid.parse(request.params.userId);
      const preferences = preferenceSchema.parse(request.body);
      const storedProfile = await findProfile(db, userId);
      if (!storedProfile) return response.status(404).json({ error: "Profile not found" });

      const current = {
        ...storedProfile,
        city: preferences.city,
        moveInDate: preferences.moveInDate,
        budgetMax: preferences.maxBudget,
        budgetMin: Math.min(storedProfile.budgetMin, preferences.maxBudget),
        interests: preferences.interests,
        sleepSchedule: preferences.sleepSchedule,
        cleanliness: preferences.cleanliness,
        socialLevel: preferences.socialLevel,
        noiseTolerance: preferences.noiseTolerance,
        guestFrequency: preferences.guestFrequency,
        smoking: preferences.smoking,
        pets: preferences.pets,
        workFromHome: preferences.workFromHome,
      };
      const candidates = await findCandidates(db, current, {
        maxBudget: preferences.maxBudget,
      });
      const scores = await scoreCandidates(current, candidates);
      const profileById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
      response.json(scores.map((score) => ({ ...score, profile: profileById.get(score.userId) })));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/swipes", async (request, response, next) => {
    const client = await db.connect();
    try {
      const swipe = swipeSchema.parse(request.body);
      if (swipe.swiperId === swipe.swipedId) {
        return response.status(400).json({ error: "You cannot swipe on your own profile" });
      }

      await client.query("BEGIN");
      await client.query(
        `INSERT INTO swipes (swiper_id, swiped_id, decision)
         VALUES ($1, $2, $3)
         ON CONFLICT (swiper_id, swiped_id) DO UPDATE SET decision = EXCLUDED.decision, created_at = NOW()`,
        [swipe.swiperId, swipe.swipedId, swipe.decision],
      );

      let match = null;
      if (swipe.decision === "like") {
        const reciprocal = await client.query(
          `SELECT 1 FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND decision = 'like'`,
          [swipe.swipedId, swipe.swiperId],
        );
        if (reciprocal.rowCount) {
          const [userA, userB] = [swipe.swiperId, swipe.swipedId].sort();
          const result = await client.query(
            `INSERT INTO matches (user_a_id, user_b_id, compatibility_score)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_a_id, user_b_id) DO UPDATE
             SET compatibility_score = EXCLUDED.compatibility_score
             RETURNING id, user_a_id AS "userAId", user_b_id AS "userBId",
               compatibility_score::float AS "compatibilityScore", created_at AS "createdAt"`,
            [userA, userB, swipe.compatibilityScore ?? 0],
          );
          match = result.rows[0];
        }
      }
      await client.query("COMMIT");
      response.status(201).json({ matched: Boolean(match), match });
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  });

  app.get("/api/matches/:userId", async (request, response, next) => {
    try {
      const userId = uuid.parse(request.params.userId);
      const result = await db.query(
        `SELECT m.id, m.compatibility_score::float AS "compatibilityScore", m.created_at AS "createdAt",
          u.id AS "userId", u.name, u.occupation, u.avatar_url AS "avatarUrl"
         FROM matches m
         JOIN users u ON u.id = CASE WHEN m.user_a_id = $1 THEN m.user_b_id ELSE m.user_a_id END
         WHERE m.user_a_id = $1 OR m.user_b_id = $1
         ORDER BY m.created_at DESC`,
        [userId],
      );
      response.json(result.rows);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ error: "Invalid request", details: error.flatten() });
    }
    console.error(error);
    response.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
