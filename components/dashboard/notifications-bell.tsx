"use client"

import { useMemo, useState, useTransition, type ComponentType } from "react"
import Link from "next/link"
import {
  BellIcon,
  CircleAlertIcon,
  InfoIcon,
  TrendingUpIcon,
} from "lucide-react"

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type {
  NotificationAlert,
  NotificationSeverity,
} from "@/types/notifications"

const SEVERITY_ICON: Record<
  NotificationSeverity,
  ComponentType<{ className?: string }>
> = {
  warning: CircleAlertIcon,
  success: TrendingUpIcon,
  info: InfoIcon,
}

type NotificationsBellProps = {
  alerts: NotificationAlert[]
}

export function NotificationsBell({ alerts }: NotificationsBellProps) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [, startTransition] = useTransition()

  const items = useMemo(
    () =>
      alerts.map((alert) => ({
        ...alert,
        unread: alert.unread && !readIds.has(alert.id),
      })),
    [alerts, readIds]
  )

  const unreadCount = items.filter((item) => item.unread).length

  function markAllRead() {
    setReadIds(new Set(alerts.map((alert) => alert.id)))
    startTransition(async () => {
      await markAllNotificationsReadAction()
    })
  }

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    startTransition(async () => {
      await markNotificationReadAction(id)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          />
        }
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                Notifications
              </span>
              <span className="text-[10px] font-normal tracking-wide text-muted-foreground uppercase">
                Workspace activity
              </span>
            </span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-normal text-primary hover:underline"
              >
                Mark all read
              </button>
            ) : (
              <Badge variant="secondary" className="font-normal">
                All caught up
              </Badge>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-80 overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet. Create a customer or ingest metrics to see
              activity here.
            </p>
          ) : (
            items.map((alert) => {
              const Icon = SEVERITY_ICON[alert.severity]
              return (
                <DropdownMenuItem
                  key={alert.id}
                  className="cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5"
                  render={<Link href={alert.href} />}
                  onClick={() => markRead(alert.id)}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      alert.severity === "warning" &&
                        "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      alert.severity === "success" &&
                        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      alert.severity === "info" && "bg-primary/15 text-primary"
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {alert.title}
                      </span>
                      {alert.unread ? (
                        <span
                          aria-label="Unread"
                          className="size-1.5 shrink-0 rounded-full bg-primary"
                        />
                      ) : null}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {alert.description}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {alert.timeLabel}
                    </span>
                  </span>
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
