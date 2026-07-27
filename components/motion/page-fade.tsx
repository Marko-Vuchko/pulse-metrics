"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageFadeProps = {
  children: ReactNode
  className?: string
}

/**
 * Light route enter fade for dashboard main content.
 * Uses CSS only (no Framer); remounts on pathname change.
 */
function PageFade({ children, className }: PageFadeProps) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className={cn(
        "flex flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
        className
      )}
    >
      {children}
    </div>
  )
}

export { PageFade }
