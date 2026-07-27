"use client"

import { cn } from "@/lib/utils"

type SaveCheckmarkProps = {
  className?: string
  /** When true, plays the stroke draw. */
  active?: boolean
}

/**
 * Inline SVG checkmark stroke-draw for save success micro-feedback.
 */
function SaveCheckmark({ className, active = true }: SaveCheckmarkProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "save-check-path",
          active && "motion-safe:animate-save-check"
        )}
      />
    </svg>
  )
}

export { SaveCheckmark }
