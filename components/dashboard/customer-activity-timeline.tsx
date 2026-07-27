import type { ComponentType } from "react"
import {
  BanIcon,
  CircleDollarSignIcon,
  FileTextIcon,
  LayersIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react"

import { cn, formatDisplayDate } from "@/lib/utils"
import type {
  CustomerActivityEvent,
  CustomerActivityKind,
} from "@/types/customers"

const KIND_ICON: Record<
  CustomerActivityKind,
  ComponentType<{ className?: string }>
> = {
  created: UserPlusIcon,
  plan: LayersIcon,
  status: SparklesIcon,
  mrr: CircleDollarSignIcon,
  note: FileTextIcon,
  cancelled: BanIcon,
}

type CustomerActivityTimelineProps = {
  events: CustomerActivityEvent[]
}

export function CustomerActivityTimeline({
  events,
}: CustomerActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-border/60 bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    )
  }

  return (
    <ol className="relative space-y-0 border-l border-border/70 pl-6">
      {events.map((event, index) => {
        const Icon = KIND_ICON[event.kind]
        const stagger = Math.min(index, 8)
        return (
          <li
            key={event.id}
            className={cn(
              "relative pb-6 last:pb-0",
              "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-1 motion-safe:fill-mode-both motion-safe:duration-200"
            )}
            style={{ animationDelay: `${stagger * 40}ms` }}
          >
            <span
              aria-hidden
              className="absolute top-0.5 -left-[1.95rem] flex size-7 items-center justify-center rounded-full border border-border/70 bg-card text-primary shadow-sm"
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {event.title}
                </p>
                <time
                  dateTime={event.at}
                  className="font-mono text-xs text-muted-foreground"
                >
                  {formatDisplayDate(event.at)}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
