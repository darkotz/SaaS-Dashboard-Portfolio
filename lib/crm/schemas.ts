import { z } from "zod";

export const accountSchema = z.object({
  company: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  status: z.enum(["active", "trial", "at_risk", "churned"]),
  seats: z.coerce.number().int().min(1).max(100000),
  mrr: z.coerce.number().min(0).max(100000000),
  industry: z.string().trim().max(100).default(""),
  website: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(40).default(""),
  health_score: z.coerce.number().int().min(0).max(100)
});

export const contactSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  title: z.string().trim().max(120).default(""),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).default(""),
  is_primary: z.coerce.boolean()
});

export const dealSchema = z.object({
  account_id: z.string().min(1),
  stage_id: z.string().min(1),
  title: z.string().trim().min(2).max(160),
  amount: z.coerce.number().min(0).max(1000000000),
  currency: z.enum(["USD", "EUR", "SEK"]),
  expected_close_date: z.string().min(1)
});

export const activitySchema = z.object({
  account_id: z.string().min(1),
  deal_id: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  type: z.enum(["note", "call", "meeting", "email"]),
  subject: z.string().trim().min(2).max(160),
  body: z.string().trim().min(2).max(5000),
  occurred_at: z.string().min(1)
});

export const taskSchema = z.object({
  account_id: z.string().min(1),
  deal_id: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).default(""),
  priority: z.enum(["low", "medium", "high"]),
  due_at: z.string().nullable().optional()
});
