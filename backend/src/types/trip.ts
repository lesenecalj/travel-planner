import { z } from "zod";

export type TripInput = {
  destination: string;
  durationWeeks: number;
  pace: "slow" | "normal" | "fast";
  interests: string[];
};

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

export const TripPlanJsonSchema = {
  type: "object",
  properties: {
    weeks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "number" },
          theme: { type: "string" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                activities: { type: "array", items: { type: "string" } },
              },
              required: ["day", "activities"],
            },
          },
        },
        required: ["week", "theme", "days"],
      },
    },
  },
  required: ["weeks"],
};