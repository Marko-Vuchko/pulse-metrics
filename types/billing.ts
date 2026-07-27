import { z } from "zod"

import { planNameSchema, type PlanName } from "@/types/customers"

export const checkoutSchema = z.object({
  plan: planNameSchema,
  cardholder: z
    .string()
    .trim()
    .min(2, "Cardholder name is required")
    .max(80, "Cardholder name is too long"),
  cardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{16}$/, "Enter a 16-digit demo card number")
    ),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "Enter a 3 or 4 digit CVC"),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export type BillingActionResult = {
  error?: string
  success?: boolean
  plan?: PlanName
  fieldErrors?: Partial<Record<string, string[]>>
}
