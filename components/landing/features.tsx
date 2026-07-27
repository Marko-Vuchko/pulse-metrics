"use client"

import {
  ActivityIcon,
  BarChart3Icon,
  FilterIcon,
  ShieldCheckIcon,
  UsersIcon,
  WavesIcon,
} from "lucide-react"

import { Reveal } from "@/components/motion/reveal"

const features = [
  {
    icon: ActivityIcon,
    title: "Live KPI pulse",
    description:
      "MRR, active users, churn, and ARPU update from seeded metric history with clear period deltas.",
  },
  {
    icon: BarChart3Icon,
    title: "Readable charts",
    description:
      "Line and bar views for revenue trends across 7, 30, and 90 day ranges.",
  },
  {
    icon: UsersIcon,
    title: "Customer workspace",
    description:
      "Search, filter, and manage plans and statuses without leaving the dashboard.",
  },
  {
    icon: FilterIcon,
    title: "URL-driven views",
    description:
      "Filters and ranges live in the query string so shareable dashboard states stay in sync.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Tenant-safe by design",
    description:
      "Supabase Auth plus RLS keeps every metric and customer row scoped to the signed-in user.",
  },
  {
    icon: WavesIcon,
    title: "Obsidian atmosphere",
    description:
      "Electric cyan accents, grid texture, and system-aware theming that feels portfolio-ready.",
  },
] as const

function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Features
          </p>
          <h2 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything you need to demo SaaS health
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            PulseMetrics is a full analytics shell: auth, overview, charts, and
            customers - ready to explore with the seeded demo account.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal
                key={feature.title}
                as="li"
                delayMs={index * 70}
                className="group landing-feature-tilt"
              >
                <div className="landing-feature-icon mb-3 inline-flex size-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary group-hover:border-primary/40 group-hover:bg-primary/15">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-mono text-base font-medium tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export { Features }
