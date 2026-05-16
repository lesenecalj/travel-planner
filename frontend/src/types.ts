export type TravelInterest = 'outdoor' | 'cultural' | 'food' | 'leisure';
export type InterestWeights = Record<TravelInterest, 0 | 1 | 2 | 3>;

export type TripInput = {
  destination: string;
  durationWeeks: number;
  pace: 'slow' | 'normal' | 'fast';
  interests: InterestWeights;
  label?: string;
};

export type Activity = {
  name: string;
  description: string;
  duration: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  type: 'cultural' | 'food' | 'outdoor' | 'transport' | 'leisure';
  tip?: string;
};

export type DayPlan = {
  day: number;
  city: string;
  activities: Activity[];
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
