import type { MatchPreferences, Recommendation } from "../types";
import { demoRecommendations } from "./demo";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export async function getRecommendations(
  userId: string,
  filters: { maxBudget: number; interests: string },
): Promise<Recommendation[]> {
  const params = new URLSearchParams({ maxBudget: String(filters.maxBudget) });
  if (filters.interests.trim()) params.set("interests", filters.interests.trim());
  const response = await fetch(`${API_URL}/recommendations/${userId}?${params}`);
  if (!response.ok) throw new Error("Could not load recommendations");
  return response.json();
}

export async function previewRecommendations(
  userId: string,
  preferences: MatchPreferences,
): Promise<Recommendation[]> {
  try {
    const response = await fetch(`${API_URL}/recommendations/${userId}/preview`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preferences),
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) throw new Error("API unavailable");
    return response.json();
  } catch {
    return demoRecommendations(preferences);
  }
}

export async function submitSwipe(input: {
  swiperId: string;
  swipedId: string;
  decision: "like" | "pass";
  compatibilityScore: number;
}) {
  try {
    const response = await fetch(`${API_URL}/swipes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) throw new Error("API unavailable");
    return response.json() as Promise<{ matched: boolean }>;
  } catch {
    return { matched: input.decision === "like" };
  }
}
