import { z } from "zod";

export const TripInputSchema = z.object({
  destination: z.string().min(1),
  durationWeeks: z.number().int().min(1).max(8),
  pace: z.enum(["slow", "normal", "fast"]),
  interests: z.array(z.string().min(1)).min(1),
  label: z.string().optional(),
});

export type TripInput = z.infer<typeof TripInputSchema>;

export const DayPlanSchema = z.object({
  day: z.number().int(),
  activities: z.array(z.string()).min(1).max(4),
});

export const WeekPlanSchema = z.object({
  week: z.number().int(),
  theme: z.string(),
  days: z.array(DayPlanSchema).length(7),
});

export const TripPlanSchema = z.object({
  weeks: z.array(WeekPlanSchema).min(1),
});

export type DayPlan = z.infer<typeof DayPlanSchema>;
export type WeekPlan = z.infer<typeof WeekPlanSchema>;
export type TripPlan = z.infer<typeof TripPlanSchema>;

export type StoredTrip = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
  input: TripInput;
  plan: TripPlan;
};

export const TripPlanJsonSchema = z.toJSONSchema(TripPlanSchema);