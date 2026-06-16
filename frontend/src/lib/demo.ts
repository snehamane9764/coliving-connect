import type { MatchPreferences, Profile, Recommendation } from "../types";

const profiles: Profile[] = [
  {
    id: "22222222-2222-4222-8222-222222222222", name: "Jordan Lee", age: 29,
    occupation: "Software Engineer", bio: "Early riser, coffee enthusiast, and tidy remote engineer who enjoys exploring the city.",
    city: "New York", moveInDate: "2026-07-15", budgetMin: 1600, budgetMax: 2300,
    avatarUrl: "https://source.unsplash.com/900x900/?indian,man,portrait,professional&sig=1",
    interests: ["Coffee", "Running", "Technology", "Cooking"], sleepSchedule: 2,
    cleanliness: 5, socialLevel: 3, noiseTolerance: 2, guestFrequency: 2,
    smoking: false, pets: false, workFromHome: true,
  },
  {
    id: "33333333-3333-4333-8333-333333333333", name: "Sofia Martinez", age: 26,
    occupation: "Marketing Strategist", bio: "Friendly creative who loves live music, dinner parties, and keeping shared spaces welcoming.",
    city: "New York", moveInDate: "2026-08-10", budgetMin: 1400, budgetMax: 2100,
    avatarUrl: "https://source.unsplash.com/900x900/?indian,woman,portrait,professional&sig=2",
    interests: ["Music", "Art", "Cooking", "Travel"], sleepSchedule: 4,
    cleanliness: 4, socialLevel: 5, noiseTolerance: 4, guestFrequency: 4,
    smoking: false, pets: false, workFromHome: false,
  },
  {
    id: "44444444-4444-4444-8444-444444444444", name: "Ethan Williams", age: 31,
    occupation: "Financial Analyst", bio: "Quiet, organized, and active. Usually at the gym after work and outdoors on weekends.",
    city: "New York", moveInDate: "2026-09-01", budgetMin: 1800, budgetMax: 2600,
    avatarUrl: "https://source.unsplash.com/900x900/?south-asian,man,portrait&sig=3",
    interests: ["Fitness", "Finance", "Hiking", "Reading"], sleepSchedule: 2,
    cleanliness: 5, socialLevel: 2, noiseTolerance: 1, guestFrequency: 1,
    smoking: false, pets: false, workFromHome: false,
  },
  {
    id: "55555555-5555-4555-8555-555555555555", name: "Priya Shah", age: 28,
    occupation: "UX Researcher", bio: "Curious researcher, plant parent, and vegetarian cook seeking a considerate roommate.",
    city: "Boston", moveInDate: "2026-08-01", budgetMin: 1300, budgetMax: 2000,
    avatarUrl: "https://source.unsplash.com/900x900/?indian,woman,portrait&sig=4",
    interests: ["Plants", "Cooking", "Design", "Reading"], sleepSchedule: 3,
    cleanliness: 4, socialLevel: 3, noiseTolerance: 2, guestFrequency: 2,
    smoking: false, pets: false, workFromHome: true,
  },
];

const similarity = (first: number, second: number) => 1 - Math.abs(first - second) / 4;

export function demoRecommendations(preferences: MatchPreferences): Recommendation[] {
  return profiles
    .filter((profile) => profile.city === preferences.city && profile.budgetMin <= preferences.maxBudget)
    .map((profile) => {
      const lifestyle = ["sleepSchedule", "cleanliness", "socialLevel", "noiseTolerance", "guestFrequency"]
        .reduce((total, key) => total + similarity(preferences[key as keyof MatchPreferences] as number, profile[key as keyof Profile] as number), 0) / 5;
      const wanted = new Set(preferences.interests.map((item) => item.toLowerCase()));
      const offered = new Set(profile.interests.map((item) => item.toLowerCase()));
      const shared = [...wanted].filter((item) => offered.has(item));
      const union = new Set([...wanted, ...offered]);
      const interestScore = shared.length / union.size;
      const overlap = Math.max(0, Math.min(preferences.maxBudget, profile.budgetMax) - profile.budgetMin);
      const budget = overlap / Math.max(1, Math.max(preferences.maxBudget, profile.budgetMax) - Math.min(1200, profile.budgetMin));
      const days = Math.abs((new Date(preferences.moveInDate).getTime() - new Date(profile.moveInDate).getTime()) / 86_400_000);
      const moveIn = Math.max(0, 1 - days / 90);
      const homeHabits = [preferences.smoking === profile.smoking, preferences.pets === profile.pets, preferences.workFromHome === profile.workFromHome].filter(Boolean).length / 3;
      const score = (lifestyle * .4 + interestScore * .2 + budget * .15 + moveIn * .1 + homeHabits * .15) * 100;
      return {
        userId: profile.id, profile, score: Math.round(score * 10) / 10,
        breakdown: { lifestyle: lifestyle * 100, interests: interestScore * 100, budget: budget * 100, move_in: moveIn * 100, deal_breakers: homeHabits * 100 },
        reasons: shared.length ? [`Shared interests: ${shared.slice(0, 3).join(", ")}`] : ["Compatible routines and housing plans"],
      };
    })
    .sort((first, second) => second.score - first.score);
}
