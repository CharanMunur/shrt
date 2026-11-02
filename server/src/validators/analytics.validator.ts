import { z } from "zod";

export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "all"]).optional().default("7d"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  timezone: z.string().optional().default("UTC"),
});

export const analyticsEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  referrerCategory: z.enum(["direct", "search", "social", "email", "other"]).optional(),
  country: z.string().optional(),
  deviceType: z.enum(["desktop", "mobile", "tablet", "unknown"]).optional(),
});

export const exportQuerySchema = z.object({
  period: z.enum(["7d", "30d", "all"]).optional().default("30d"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  format: z.enum(["json", "csv"]).optional().default("csv"),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type AnalyticsEventsQuery = z.infer<typeof analyticsEventsQuerySchema>;
export type ExportQuery = z.infer<typeof exportQuerySchema>;
