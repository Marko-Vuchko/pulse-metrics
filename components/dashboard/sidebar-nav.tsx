"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useSidebar } from "@/components/dashboard/sidebar-context"
import { dashboardNavGroups } from "@/components/dashboard/nav"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  onNavigate?: () => void
  /** Force expanded labels (mobile sheet). */
  forceExpanded?: boolean
  /** Stagger nav item enter (mobile sheet open). */
  staggerItems?: boolean
}

/**
 * Dashboard nav. Active styles are CSS-only (no sliding-pill measurement)
 * so layout effects cannot loop.
 */
export function SidebarNav({
  onNavigate,
  forceExpanded = false,
  staggerItems = false,
}: SidebarNavProps) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const iconOnly = collapsed && !forceExpanded

  let itemIndex = 0

  return (
    <nav
      className={cn(
        "relative flex flex-1 flex-col gap-6 py-4",
        iconOnly ? "px-2" : "px-3"
      )}
      aria-label="Dashboard"
    >
      {dashboardNavGroups.map((group) => (
        <div key={group.label} className="relative z-[1] flex flex-col gap-1">
          {!iconOnly ? (
            <p className="px-2 font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {group.label}
            </p>
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
              const stagger = staggerItems ? itemIndex++ : 0

              return (
                <li
                  key={item.href}
                  className={
                    staggerItems
                      ? "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 motion-safe:fill-mode-both motion-safe:duration-200"
                      : undefined
                  }
                  style={
                    staggerItems
                      ? { animationDelay: `${stagger * 45}ms` }
                      : undefined
                  }
                >
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={iconOnly ? item.title : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl text-sm motion-safe:transition-colors",
                      iconOnly ? "justify-center px-2 py-2.5" : "px-2.5 py-2",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-primary"
                      )}
                    />
                    {!iconOnly ? <span>{item.title}</span> : null}
                    {iconOnly ? (
                      <span className="sr-only">{item.title}</span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
