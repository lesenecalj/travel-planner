import { z } from "zod";

export const TRAVEL_INTERESTS = ["outdoor", "cultural", "food", "leisure"] as const;
export type TravelInterest = typeof TRAVEL_INTERESTS[number];
export type InterestWeights = Record<TravelInterest, 0 | 1 | 2 | 3>;

export const TripInputSchema = z.object({
  destination: z.string().min(1),
  durationWeeks: z.number().int().min(1).max(8),
  pace: z.enum(["slow", "normal", "fast"]),
  interests: z.object({
    outdoor:  z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    cultural: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    food:     z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
    leisure:  z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
  }),
  label: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type TripInput = z.infer<typeof TripInputSchema>;

export const ActivitySchema = z.object({
  name: z.string(),
  description: z.string(),
  duration: z.string(),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  type: z.enum(["cultural", "food", "outdoor", "transport", "leisure"]),
  tip: z.string().optional(),
});

export const DayPlanSchema = z.object({
  day: z.number().int(),
  city: z.string(),
  activities: z.array(ActivitySchema).min(1).max(4),
});

export const WeekPlanSchema = z.object({
  week: z.number().int(),
  theme: z.string(),
  days: z.array(DayPlanSchema).length(7),
});

export const TripPlanSchema = z.object({
  weeks: z.array(WeekPlanSchema).min(1),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type WeekPlan = z.infer<typeof WeekPlanSchema>;
export type TripPlan = z.infer<typeof TripPlanSchema>;

export type TripRecord = TripInput & {
  id: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
  plan: TripPlan;
};

export type TripDto = TripRecord;

export const TripPlanJsonSchema = z.toJSONSchema(TripPlanSchema);