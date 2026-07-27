"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ContentFadeProps = {
  children: ReactNode
  className?: string
}

/**
 * Soft enter after Suspense resolves - skeleton → content crossfade feel.
 * Prefer wrapping async page bodies so loading.tsx does not hard-swap.
 */
function ContentFade({ children, className }: ContentFadeProps) {
  return (
    <div
      data-slot="content-fade"
      className={cn(
        "flex flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-safe:fill-mode-both",
        className
      )}
    >
      {children}
    </div>
  )
}

export { ContentFade }
