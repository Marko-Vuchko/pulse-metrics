"use client"

import Link from "next/link"

import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { Magnetic } from "@/components/landing/magnetic"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HEADLINE_WORDS = ["SaaS", "metrics", "that", "stay", "sharp"] as const

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(72vh,720px)] bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.14_210/0.18),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.82_0.14_200/0.12),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
        <div className="flex max-w-3xl flex-col items-center text-center">
          <h1 className="landing-stagger-1 font-heading text-5xl font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
            PulseMetrics
          </h1>
          <p className="landing-stagger-2 mt-4 font-mono text-lg font-medium tracking-tight text-foreground/90 sm:text-xl md:text-2xl">
            {HEADLINE_WORDS.map((word, index) => (
              <span
                key={word}
                className="landing-word inline-block"
                style={{ animationDelay: `${0.18 + index * 0.055}s` }}
              >
                {word}
                {index < HEADLINE_WORDS.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </p>
          <p className="landing-stagger-3 mt-4 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
            Track MRR, churn, and customers in one dark-first analytics shell
            built for indie hackers and small teams.
          </p>
          <div className="landing-stagger-4 mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Magnetic>
              <a
                href="#demo-credentials"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "landing-cta-pulse min-w-48"
                )}
              >
                View demo dashboard
              </a>
            </Magnetic>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-w-48"
              )}
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="landing-stagger-5 mt-12 w-full sm:mt-14">
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}

export { Hero }
