import { z } from "zod";

export const StatValuesSchema = z.strictObject({
  totalVisits: z.number(),
  totalFilteredVisits: z.number(),
  totalBlockedImages: z.number(),
});

export const StatSchema = z.strictObject({
  userId: z.string(),
  stats: StatValuesSchema,
});

export type Stats = z.infer<typeof StatSchema>;
export type StatValues = z.infer<typeof StatValuesSchema>;
