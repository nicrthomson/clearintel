import * as z from "zod"

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  organization: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    address: z.string().optional(),
  }).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const organizationSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
})

export const evidenceTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export const customFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["text", "number", "date", "boolean", "select"]),
  required: z.boolean().default(false),
  options: z.string().optional(), // JSON array for select type
})
