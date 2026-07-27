"use client"

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react"

import { useReducedMotion } from "@/components/motion/use-reduced-motion"
import { cn } from "@/lib/utils"

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

/** Subtle magnetic pull toward the pointer (desktop, motion-safe). */
function Magnetic({ children, className, strength = 10 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      setOffset({
        x: (x / rect.width) * strength,
        y: (y / rect.height) * strength,
      })
    },
    [reducedMotion, strength]
  )

  const onLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={ref}
      className={cn("inline-flex will-change-transform", className)}
      style={
        {
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: reducedMotion
            ? undefined
            : "transform 160ms ease-out",
        } as CSSProperties
      }
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}

export { Magnetic }
