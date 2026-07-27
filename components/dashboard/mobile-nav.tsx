"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border px-4 py-4">
          <SheetTitle className="text-left">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="font-mono text-sm font-semibold tracking-tight text-primary"
            >
              PulseMetrics
            </Link>
          </SheetTitle>
        </SheetHeader>
        <SidebarNav
          forceExpanded
          staggerItems
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
