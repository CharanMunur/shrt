import { z } from "zod";
import { isReservedCode } from "../lib/reservedCodes.js";

const urlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
    message: "Destination URL must start with http:// or https://",
  });

export const createLinkSchema = z.object({
  destinationUrl: urlSchema,
  code: z
    .string()
    .trim()
    .min(3, "Custom code must be at least 3 characters")
    .max(30, "Custom code cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Code may only contain letters, numbers, underscores, and hyphens")
    .refine((val) => !isReservedCode(val), {
      message: "This code is reserved by the system",
    })
    .optional(),
  iosUrl: urlSchema.optional().or(z.literal("")),
  androidUrl: urlSchema.optional().or(z.literal("")),
  expiresAt: z.string().datetime().optional().nullable(),
  maxClicks: z.number().int().positive("Max clicks must be a positive integer").optional().nullable(),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100)
    .optional()
    .or(z.literal("")),
});

export const updateLinkSchema = z.object({
  destinationUrl: urlSchema.optional(),
  iosUrl: urlSchema.optional().nullable().or(z.literal("")),
  androidUrl: urlSchema.optional().nullable().or(z.literal("")),
  expiresAt: z.string().datetime().optional().nullable().or(z.literal("")),
  maxClicks: z.number().int().positive().optional().nullable().or(z.literal(0)),
  isActive: z.boolean().optional(),
  password: z.string().min(4).max(100).optional().nullable().or(z.literal("")),
});

export const unlockLinkSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type UnlockLinkInput = z.infer<typeof unlockLinkSchema>;
