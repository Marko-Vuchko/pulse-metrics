import { z } from "zod"

import type { PlanName } from "@/types/customers"

export type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  avatar_url: string | null
  billing_plan: PlanName
  created_at: string
  updated_at: string
}

export const settingsSchema = z.object({
  company_name: z
    .string()
    .trim()
    .max(120, "Company name must be at most 120 characters"),
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name must be at most 120 characters"),
})

export const accountNameSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name must be at most 120 characters"),
})

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SettingsInput = z.infer<typeof settingsSchema>
export type AccountNameInput = z.infer<typeof accountNameSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export type ProfileActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Partial<Record<string, string[]>>
}
