"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

function DashboardPreview() {
  const bars = [38, 52, 46, 61, 58, 72, 68, 80, 76, 88, 84, 94]
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activeHeight = activeIndex === null ? null : bars[activeIndex]

  return (
    <div
      id="preview"
      className="landing-preview-frame relative mx-auto w-full max-w-5xl scroll-mt-20 overflow-hidden rounded-[1.25rem] border border-border/80 bg-card shadow-[0_28px_80px_-36px_oklch(0.12_0.03_255/0.85)] sm:rounded-[1.5rem]"
      role="region"
      aria-label="PulseMetrics dashboard preview showing MRR, active users, churn, ARPU, and an interactive MRR trend chart"
    >
      <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-3 sm:px-5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </div>
        <p className="min-w-0 flex-1 truncate text-center font-mono text-[11px] tracking-wide text-muted-foreground sm:text-xs">
          app.pulsemetrics.dev / overview
        </p>
        <span className="hidden w-10 sm:block" aria-hidden />
      </div>

      <div className="bg-background/80 p-4 sm:p-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Overview</p>
            <p className="font-heading text-sm font-semibold tracking-tight sm:text-base">
              Last 30 days
            </p>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground sm:text-xs">
            {activeHeight === null
              ? "Hover bars to scrub"
              : `Day ${activeIndex! + 1} · ${activeHeight}%`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {[
            { label: "MRR", value: "€12.4k", delta: "+4.2%" },
            { label: "Active", value: "1,842", delta: "+2.1%" },
            { label: "Churn", value: "2.4%", delta: "-0.3%" },
            { label: "ARPU", value: "€48", delta: "+1.8%" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border/60 bg-card/90 px-3 py-3 sm:rounded-2xl"
            >
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {kpi.label}
              </p>
              <p className="mt-1 font-heading text-lg font-semibold tracking-tight sm:text-xl">
                {kpi.value}
              </p>
              <p className="mt-0.5 font-mono text-xs text-success">
                {kpi.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border/60 bg-card/70 p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
          <p className="mb-3 font-heading text-sm font-medium">MRR trend</p>
          <div
            className="landing-chart-bars flex h-36 items-end gap-1.5 sm:h-40 sm:gap-2"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {bars.map((height, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Day ${index + 1}, height ${height} percent`}
                className={cn(
                  "landing-chart-bar relative flex-1 rounded-t-md bg-gradient-to-t from-primary/40 to-primary outline-none transition-[opacity,transform] duration-150",
                  activeIndex !== null && activeIndex !== index
                    ? "opacity-35"
                    : "opacity-100",
                  activeIndex === index && "scale-y-105"
                )}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 60}ms`,
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { DashboardPreview }
