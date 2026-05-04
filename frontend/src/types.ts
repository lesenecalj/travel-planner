export type TripInput = {
  destination: string;
  durationWeeks: number;
  pace: 'slow' | 'normal' | 'fast';
  interests: string[];
  label?: string;
};

export type DayPlan = {
  day: number;
  activities: string[];
};

export type WeekPlan = {
  week: number;
  theme: string;
  days: DayPlan[];
};

export type TripPlan = {
  weeks: WeekPlan[];
};

export type Trip = {
  id: string;
  userId: string;
  isPublic: boolean;
  version: number;
  createdAt: string;
  updatedAt?: string;
  input: TripInput;
  plan: TripPlan;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
