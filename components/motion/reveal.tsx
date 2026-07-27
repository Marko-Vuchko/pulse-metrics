"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

import { useReducedMotion } from "@/components/motion/use-reduced-motion"
import { cn } from "@/lib/utils"

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay in ms when entering viewport. */
  delayMs?: number
  as?: "div" | "li" | "article" | "section"
}

/**
 * Scroll-triggered fade/slide reveal via IntersectionObserver.
 * Respects prefers-reduced-motion (shows immediately).
 */
function Reveal({
  children,
  className,
  delayMs = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const shown = reducedMotion || visible

  useEffect(() => {
    if (reducedMotion) return

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal-base", shown && "reveal-visible", className)}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

export { Reveal }
export type { RevealProps }
