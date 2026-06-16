import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

describe("health endpoint", () => {
  it("reports a healthy API and database", async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }) };
    const response = await request(createApp(db as never)).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(db.query).toHaveBeenCalledWith("SELECT 1");
  });
});

describe("preference preview endpoint", () => {
  it("uses questionnaire answers to request ranked matches", async () => {
    const profile = {
      id: "11111111-1111-4111-8111-111111111111", name: "Maya", email: "maya@example.com",
      age: 27, occupation: "Designer", bio: "Hello", city: "New York", moveInDate: "2026-08-01",
      budgetMin: 1500, budgetMax: 2200, avatarUrl: "https://example.com/maya.jpg",
      interests: ["design"], sleepSchedule: 3, cleanliness: 4, socialLevel: 3,
      noiseTolerance: 2, guestFrequency: 2, smoking: false, pets: false, workFromHome: true,
    };
    const candidate = { ...profile, id: "22222222-2222-4222-8222-222222222222", name: "Jordan" };
    const db = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [profile] })
        .mockResolvedValueOnce({ rows: [candidate] }),
    };
    const scoringFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations: [{
        user_id: candidate.id, score: 91, breakdown: { interests: 80 }, reasons: ["Shared interests"],
      }] }),
    });
    vi.stubGlobal("fetch", scoringFetch);

    const response = await request(createApp(db as never))
      .post(`/api/recommendations/${profile.id}/preview`)
      .send({
        city: "New York", moveInDate: "2026-08-15", maxBudget: 2400,
        interests: ["Cooking", "Hiking", "Music"], sleepSchedule: 2,
        cleanliness: 5, socialLevel: 3, noiseTolerance: 2, guestFrequency: 2,
        smoking: false, pets: true, workFromHome: true,
      });

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ score: 91, profile: { name: "Jordan" } });
    const scoringBody = JSON.parse(scoringFetch.mock.calls[0][1].body);
    expect(scoringBody.current_user.interests).toEqual(["Cooking", "Hiking", "Music"]);
    vi.unstubAllGlobals();
  });
});
