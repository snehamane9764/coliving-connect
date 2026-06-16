import type { Profile, Recommendation } from "./types.js";

function toScoringProfile(profile: Profile) {
  return {
    id: profile.id,
    city: profile.city,
    move_in_date: profile.moveInDate,
    budget_min: profile.budgetMin,
    budget_max: profile.budgetMax,
    interests: profile.interests,
    sleep_schedule: profile.sleepSchedule,
    cleanliness: profile.cleanliness,
    social_level: profile.socialLevel,
    noise_tolerance: profile.noiseTolerance,
    guest_frequency: profile.guestFrequency,
    smoking: profile.smoking,
    pets: profile.pets,
    work_from_home: profile.workFromHome,
  };
}

export async function scoreCandidates(
  current: Profile,
  candidates: Profile[],
): Promise<Recommendation[]> {
  const url = `${process.env.RECOMMENDER_URL ?? "http://localhost:8000"}/recommendations`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      current_user: toScoringProfile(current),
      candidates: candidates.map(toScoringProfile),
    }),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Recommendation service returned ${response.status}`);
  }

  const body = (await response.json()) as {
    recommendations: Array<{
      user_id: string;
      score: number;
      breakdown: Record<string, number>;
      reasons: string[];
    }>;
  };
  return body.recommendations.map((item) => ({
    userId: item.user_id,
    score: item.score,
    breakdown: item.breakdown,
    reasons: item.reasons,
  }));
}
