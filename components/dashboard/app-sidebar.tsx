"use client"

import Link from "next/link"
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"

import { useSidebar } from "@/components/dashboard/sidebar-context"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col motion-safe:transition-[width] motion-safe:duration-200 motion-safe:ease-out",
        collapsed ? "w-[4.25rem]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {!collapsed ? (
          <Link
            href="/dashboard"
            className="min-w-0 flex-1 truncate font-mono text-sm font-semibold tracking-tight text-primary transition-opacity hover:opacity-90"
          >
            PulseMetrics
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="font-mono text-sm font-semibold tracking-tight text-primary"
            aria-label="PulseMetrics"
          >
            P
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
          className={cn(collapsed && "sr-only")}
        >
          {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </Button>
      </div>
      {collapsed ? (
        <div className="flex justify-center pb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Expand sidebar"
            onClick={toggle}
          >
            <PanelLeftOpenIcon />
          </Button>
        </div>
      ) : null}
      <Separator className="bg-sidebar-border" />
      <SidebarNav />
      {!collapsed ? (
        <div className="mt-auto border-t border-sidebar-border p-4">
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            Fluxis Labs
          </p>
        </div>
      ) : (
        <div className="mt-auto border-t border-sidebar-border p-2" />
      )}
    </aside>
  )
}
