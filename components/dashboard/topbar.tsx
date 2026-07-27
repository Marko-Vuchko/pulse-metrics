"use client"

import { useCallback, useState } from "react"
import { usePathname } from "next/navigation"
import { SearchIcon } from "lucide-react"

import {
  CommandPalette,
  useCommandPaletteHotkey,
} from "@/components/dashboard/command-palette"
import { getPageTitle } from "@/components/dashboard/nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { NotificationsBell } from "@/components/dashboard/notifications-bell"
import { UserMenu } from "@/components/dashboard/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import type { NotificationAlert } from "@/types/notifications"

type TopbarProps = {
  email: string
  fullName: string | null
  initials: string
  alerts: NotificationAlert[]
}

export function Topbar({ email, fullName, initials, alerts }: TopbarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  useCommandPaletteHotkey(openPalette)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <MobileNav />

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-mono text-sm font-semibold tracking-tight md:text-base">
          {title}
        </h1>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPaletteOpen(true)}
        className="hidden h-8 w-full max-w-xs justify-start gap-2 text-muted-foreground sm:inline-flex"
        aria-label="Open command palette"
      >
        <SearchIcon className="size-3.5 shrink-0" />
        <span className="flex-1 truncate text-left text-sm">
          Search or jump to...
        </span>
        <kbd className="pointer-events-none hidden rounded border border-border/80 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="sm:hidden"
        aria-label="Open command palette"
        onClick={() => setPaletteOpen(true)}
      >
        <SearchIcon />
      </Button>

      <ThemeToggle />
      <NotificationsBell alerts={alerts} />
      <UserMenu email={email} fullName={fullName} initials={initials} />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  )
}
