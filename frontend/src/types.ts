export interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  city: string;
  moveInDate: string;
  budgetMin: number;
  budgetMax: number;
  avatarUrl: string;
  interests: string[];
  sleepSchedule: number;
  cleanliness: number;
  socialLevel: number;
  noiseTolerance: number;
  guestFrequency: number;
  smoking: boolean;
  pets: boolean;
  workFromHome: boolean;
}

export interface Recommendation {
  userId: string;
  score: number;
  breakdown: Record<string, number>;
  reasons: string[];
  profile: Profile;
}

export interface MatchPreferences {
  city: string;
  moveInDate: string;
  maxBudget: number;
  interests: string[];
  sleepSchedule: number;
  cleanliness: number;
  socialLevel: number;
  noiseTolerance: number;
  guestFrequency: number;
  smoking: boolean;
  pets: boolean;
  workFromHome: boolean;
}
