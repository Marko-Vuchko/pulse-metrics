import { z } from "zod"

export const metricsRangeSchema = z.enum(["7d", "30d", "90d"])

export type MetricsRange = z.infer<typeof metricsRangeSchema>

export const METRICS_RANGES = metricsRangeSchema.options

export type MetricPointRow = {
  date: string
  mrr: number
  active_users: number
  churn_rate: number
  arpu: number
}

export type MetricPointListItem = MetricPointRow & {
  id: string
}

export type KpiKey = "mrr" | "active_users" | "churn_rate" | "arpu"

export type KpiCardData = {
  key: KpiKey
  label: string
  value: number
  previousValue: number | null
  /** Relative change vs 7 days ago, as a percentage (e.g. 4.2 = +4.2%). */
  deltaPct: number | null
  /** When true, a decrease is positive (green). */
  inverted: boolean
  format: "currency" | "number" | "percent"
}

export type OverviewMetrics = {
  empty: boolean
  range: MetricsRange
  kpis: KpiCardData[]
  series: MetricPointRow[]
}

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")

/** Validated metric point used by Server Actions (numbers). */
export const metricPointWriteSchema = z.object({
  date: isoDateSchema,
  mrr: z
    .number()
    .finite("MRR must be a number")
    .min(0, "MRR cannot be negative")
    .max(1_000_000_000, "MRR is too large"),
  active_users: z
    .number()
    .int("Active users must be a whole number")
    .min(0, "Active users cannot be negative")
    .max(100_000_000, "Active users is too large"),
  churn_rate: z
    .number()
    .finite("Churn must be a number")
    .min(0, "Churn cannot be negative")
    .max(1, "Churn must be between 0 and 1 (e.g. 0.025)"),
  arpu: z
    .number()
    .finite("ARPU must be a number")
    .min(0, "ARPU cannot be negative")
    .max(1_000_000, "ARPU is too large"),
})

export type MetricPointWriteInput = z.infer<typeof metricPointWriteSchema>

const nonNegNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .transform((value, ctx) => {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({ code: "custom", message: `${label} must be a number` })
        return z.NEVER
      }
      if (parsed < 0) {
        ctx.addIssue({ code: "custom", message: `${label} cannot be negative` })
        return z.NEVER
      }
      if (parsed > max) {
        ctx.addIssue({ code: "custom", message: `${label} is too large` })
        return z.NEVER
      }
      return parsed
    })

const nonNegInt = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .transform((value, ctx) => {
      const parsed = Number(value)
      if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be a whole number`,
        })
        return z.NEVER
      }
      if (parsed < 0) {
        ctx.addIssue({ code: "custom", message: `${label} cannot be negative` })
        return z.NEVER
      }
      if (parsed > max) {
        ctx.addIssue({ code: "custom", message: `${label} is too large` })
        return z.NEVER
      }
      return parsed
    })

/** Form + CSV row shape (string fields → numbers). */
export const metricPointFormSchema = z.object({
  date: isoDateSchema,
  mrr: nonNegNumber("MRR", 1_000_000_000),
  active_users: nonNegInt("Active users", 100_000_000),
  churn_rate: z
    .string()
    .trim()
    .min(1, "Churn is required")
    .transform((value, ctx) => {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({ code: "custom", message: "Churn must be a number" })
        return z.NEVER
      }
      if (parsed < 0 || parsed > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Churn must be between 0 and 1 (e.g. 0.025)",
        })
        return z.NEVER
      }
      return parsed
    }),
  arpu: nonNegNumber("ARPU", 1_000_000),
})

export type MetricPointFormInput = {
  date: string
  mrr: string
  active_users: string
  churn_rate: string
  arpu: string
}

export const metricPointsBulkWriteSchema = z
  .array(metricPointWriteSchema)
  .min(1, "Add at least one row")
  .max(366, "Import at most 366 rows at once")

export type MetricPointsBulkWriteInput = z.infer<
  typeof metricPointsBulkWriteSchema
>

export type MetricsWriteActionResult = {
  error?: string
  success?: boolean
  upserted?: number
  fieldErrors?: Partial<Record<string, string[]>>
}
