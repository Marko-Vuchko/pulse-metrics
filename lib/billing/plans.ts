import type { PlanName } from "@/types/customers"

export type BillingTier = {
  name: PlanName
  priceMonthly: number
  priceLabel: string
  blurb: string
  highlighted: boolean
  features: string[]
}

export const BILLING_TIERS: BillingTier[] = [
  {
    name: "Basic",
    priceMonthly: 0,
    priceLabel: "€0",
    blurb: "Explore core KPIs and the demo dataset.",
    highlighted: false,
    features: [
      "Overview KPIs",
      "7-day metric range",
      "Customer list",
      "Email/password auth",
    ],
  },
  {
    name: "Plus",
    priceMonthly: 29,
    priceLabel: "€29",
    blurb: "Full analytics depth for demos and portfolio reviews.",
    highlighted: true,
    features: [
      "Everything in Basic",
      "30 and 90 day ranges",
      "Analytics 2x2 charts",
      "Customer CRUD + filters",
    ],
  },
  {
    name: "Premium",
    priceMonthly: 79,
    priceLabel: "€79",
    blurb: "Showcase-ready packaging for client conversations.",
    highlighted: false,
    features: [
      "Everything in Plus",
      "Team invites",
      "Metrics ingest",
      "Priority portfolio polish",
    ],
  },
]

export function getBillingTier(plan: PlanName): BillingTier {
  return BILLING_TIERS.find((tier) => tier.name === plan) ?? BILLING_TIERS[0]
}
