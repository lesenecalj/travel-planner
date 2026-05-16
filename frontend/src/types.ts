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

export type Trip = TripInput & {
  id: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
  plan: TripPlan;
};

export type AuthTokens = {
  accessToken: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
