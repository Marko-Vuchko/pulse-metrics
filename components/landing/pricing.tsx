"use client"

import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { Magnetic } from "@/components/landing/magnetic"
import { Reveal } from "@/components/motion/reveal"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tiers = [
  {
    name: "Basic",
    price: "€0",
    blurb: "Explore the shell with core KPIs and the demo dataset.",
    highlighted: false,
    features: [
      "Overview KPIs",
      "7-day metric range",
      "Customer list (read)",
      "Email/password auth",
    ],
  },
  {
    name: "Plus",
    price: "€29",
    blurb: "Full analytics depth for product demos and portfolio reviews.",
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
    price: "€79",
    blurb: "Showcase-ready packaging for Fluxis Labs client conversations.",
    highlighted: false,
    features: [
      "Everything in Plus",
      "Account + settings shell",
      "Theme system (dark/light)",
      "Portfolio-ready polish",
    ],
  },
] as const

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Pricing
          </p>
          <h2 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Simple tiers, no checkout
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Plan names match the demo customer plans. This is a product
            showcase - there is no payment flow in v1.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Reveal
              key={tier.name}
              as="article"
              delayMs={index * 90}
              className={cn(
                "landing-card-hover flex flex-col rounded-[1.5rem] border p-6",
                tier.highlighted
                  ? "sticky top-20 z-[1] border-primary/40 bg-primary/5 shadow-[0_0_40px_-20px_oklch(0.82_0.14_200/0.55)] hover:border-primary/55 hover:shadow-[0_0_48px_-16px_oklch(0.82_0.14_200/0.7)] lg:static"
                  : "border-border/80 bg-card/40 hover:border-primary/30 hover:shadow-[0_0_36px_-20px_oklch(0.82_0.14_200/0.4)]"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-lg font-semibold tracking-tight">
                  {tier.name}
                </h3>
                {tier.highlighted ? (
                  <Badge className="font-mono">Recommended</Badge>
                ) : null}
              </div>
              <p className="mt-4 font-mono text-4xl font-semibold tracking-tight">
                {tier.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / mo
                </span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{tier.blurb}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground/90"
                  >
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.highlighted ? (
                <Magnetic className="mt-6 w-full" strength={14}>
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full justify-center"
                    )}
                  >
                    Start with Plus
                  </Link>
                </Magnetic>
              ) : (
                <p className="mt-6 font-mono text-xs text-muted-foreground">
                  Included in the public demo - no purchase required.
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Pricing }
