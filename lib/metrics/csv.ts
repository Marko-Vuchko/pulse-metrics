import { metricPointFormSchema } from "@/types/metrics"
import type { MetricPointWriteInput } from "@/types/metrics"

export type CsvParseResult =
  | { ok: true; rows: MetricPointWriteInput[] }
  | { ok: false; error: string }

const REQUIRED_HEADERS = [
  "date",
  "mrr",
  "active_users",
  "churn_rate",
  "arpu",
] as const

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim())
      current = ""
      continue
    }
    current += char
  }

  cells.push(current.trim())
  return cells
}

/**
 * Parse a metrics CSV with header:
 * date,mrr,active_users,churn_rate,arpu
 */
export function parseMetricsCsv(text: string): CsvParseResult {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return {
      ok: false,
      error: "CSV needs a header row and at least one data row.",
    }
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing columns: ${missing.join(", ")}. Expected ${REQUIRED_HEADERS.join(", ")}.`,
    }
  }

  const index = Object.fromEntries(
    REQUIRED_HEADERS.map((key) => [key, headers.indexOf(key)])
  ) as Record<(typeof REQUIRED_HEADERS)[number], number>

  const rows: MetricPointWriteInput[] = []

  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i])
    const raw = {
      date: cells[index.date] ?? "",
      mrr: cells[index.mrr] ?? "",
      active_users: cells[index.active_users] ?? "",
      churn_rate: cells[index.churn_rate] ?? "",
      arpu: cells[index.arpu] ?? "",
    }
    const parsed = metricPointFormSchema.safeParse(raw)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return {
        ok: false,
        error: `Row ${i + 1}: ${issue?.message ?? "Invalid values"}`,
      }
    }
    rows.push(parsed.data)
  }

  return { ok: true, rows }
}

export const METRICS_CSV_TEMPLATE = `date,mrr,active_users,churn_rate,arpu
2026-07-01,12450.00,812,0.0240,42.10
2026-07-02,12510.00,818,0.0238,42.25
`

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Serialize metric points to the same CSV shape used by import. */
export function serializeMetricsCsv(
  rows: Array<{
    date: string
    mrr: number
    active_users: number
    churn_rate: number
    arpu: number
  }>
): string {
  const header = REQUIRED_HEADERS.join(",")
  const lines = rows.map((row) =>
    [
      csvEscape(row.date),
      csvEscape(String(row.mrr)),
      csvEscape(String(row.active_users)),
      csvEscape(String(row.churn_rate)),
      csvEscape(String(row.arpu)),
    ].join(",")
  )
  return [header, ...lines].join("\n")
}
