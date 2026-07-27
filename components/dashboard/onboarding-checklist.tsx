"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSyncExternalStore, useTransition } from "react"
import { CheckCircle2Icon, CircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "pulse-onboarding-checklist"
const DISMISS_KEY = "pulse-onboarding-dismissed"

type ChecklistItem = {
  id: string
  label: string
  href: string
  done: boolean
}

type OnboardingChecklistProps = {
  hasCustomers: boolean
  hasMetrics: boolean
}

function subscribeOnboarding(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener("pulse-onboarding", onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener("pulse-onboarding", onStoreChange)
  }
}

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

function readExploredAnalytics() {
  try {
    if (window.location.pathname.startsWith("/dashboard/analytics")) {
      return true
    }
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { exploredAnalytics?: boolean }
    return Boolean(parsed.exploredAnalytics)
  } catch {
    return false
  }
}

export function OnboardingChecklist({
  hasCustomers,
  hasMetrics,
}: OnboardingChecklistProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const dismissed = useSyncExternalStore(
    subscribeOnboarding,
    readDismissed,
    () => true
  )
  const exploredAnalytics = useSyncExternalStore(
    subscribeOnboarding,
    readExploredAnalytics,
    () => false
  )

  if (dismissed) return null

  const items: ChecklistItem[] = [
    {
      id: "customer",
      label: "Create first customer",
      href: "/dashboard/customers?create=1",
      done: hasCustomers,
    },
    {
      id: "metrics",
      label: "Ingest first metrics day",
      href: "/dashboard/metrics",
      done: hasMetrics,
    },
    {
      id: "analytics",
      label: "Explore analytics",
      href: "/dashboard/analytics",
      done: exploredAnalytics,
    },
  ]

  const doneCount = items.filter((item) => item.done).length
  const allDone = doneCount === items.length

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("pulse-onboarding"))
  }

  function markAnalyticsExplored() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ exploredAnalytics: true })
      )
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("pulse-onboarding"))
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-primary uppercase">
            Getting started
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {allDone
              ? "You are set - keep exploring the product loop."
              : `${doneCount}/${items.length} complete - customers, metrics, then charts.`}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss checklist"
          onClick={dismiss}
        >
          <XIcon />
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-background/60",
                item.done && "text-muted-foreground"
              )}
              onClick={() => {
                if (item.id === "analytics") {
                  markAnalyticsExplored()
                }
                startTransition(() => {
                  router.push(item.href)
                })
              }}
            >
              {item.done ? (
                <CheckCircle2Icon className="size-4 text-success" />
              ) : (
                <CircleIcon className="size-4 text-muted-foreground" />
              )}
              <span className={cn(item.done && "line-through")}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {allDone ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Or open{" "}
          <Link
            href="/dashboard/customers"
            className="text-primary underline-offset-4 hover:underline"
          >
            Customers
          </Link>{" "}
          anytime.
        </p>
      ) : null}
    </div>
  )
}
