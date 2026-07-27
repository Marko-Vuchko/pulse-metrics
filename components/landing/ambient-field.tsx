"use client"

import { useEffect, useRef } from "react"

import { useReducedMotion } from "@/components/motion/use-reduced-motion"
import { cn } from "@/lib/utils"

const PARTICLE_COUNT = 28

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
}

type AmbientFieldProps = {
  className?: string
  /** Softer orbs for auth/legal surfaces. */
  intensity?: "default" | "soft"
}

/**
 * Lightweight ambient layer over bg-atmosphere.
 * CSS orbs + Canvas particles; paused when tab hidden or reduced-motion.
 */
function AmbientField({
  className,
  intensity = "default",
}: AmbientFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let running = true
    let width = 0
    let height = 0
    let dpr = 1
    let pointerX = 0.5
    let pointerY = 0.5
    let targetX = 0.5
    let targetY = 0.5

    const particles: Particle[] = []

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = wrap!.clientWidth
      height = wrap!.clientHeight
      canvas!.width = Math.floor(width * dpr)
      canvas!.height = Math.floor(height * dpr)
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (particles.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35 - 0.12,
            r: 0.6 + Math.random() * 1.8,
            a: 0.15 + Math.random() * 0.35,
          })
        }
      }
    }

    function onPointerMove(event: PointerEvent) {
      const rect = wrap!.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      targetX = (event.clientX - rect.left) / rect.width
      targetY = (event.clientY - rect.top) / rect.height
    }

    function onVisibility() {
      running = document.visibilityState === "visible"
      if (running) raf = requestAnimationFrame(tick)
    }

    function tick() {
      if (!running) return

      pointerX += (targetX - pointerX) * 0.05
      pointerY += (targetY - pointerY) * 0.05

      // Deeper parallax than baseline for atmospheric depth
      const parallaxX = (pointerX - 0.5) * 32
      const parallaxY = (pointerY - 0.5) * 22
      wrap!.style.setProperty("--ambient-px", `${parallaxX.toFixed(2)}px`)
      wrap!.style.setProperty("--ambient-py", `${parallaxY.toFixed(2)}px`)

      ctx!.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains("dark")
      const stroke = isDark
        ? "oklch(0.82 0.14 200 / "
        : "oklch(0.55 0.14 210 / "

      for (const p of particles) {
        p.x += p.vx + (pointerX - 0.5) * 0.22
        p.y += p.vy + (pointerY - 0.5) * 0.16

        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `${stroke}${p.a})`
        ctx!.fill()
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > 110) continue
          const alpha = (1 - dist / 110) * 0.12
          ctx!.beginPath()
          ctx!.moveTo(a.x, a.y)
          ctx!.lineTo(b.x, b.y)
          ctx!.strokeStyle = `${stroke}${alpha})`
          ctx!.lineWidth = 1
          ctx!.stroke()
        }
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.addEventListener("visibilitychange", onVisibility)
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "ambient-orb ambient-orb-a absolute rounded-full blur-3xl",
          intensity === "soft" ? "opacity-40" : "opacity-70"
        )}
      />
      <div
        className={cn(
          "ambient-orb ambient-orb-b absolute rounded-full blur-3xl",
          intensity === "soft" ? "opacity-30" : "opacity-55"
        )}
      />
      <div
        className={cn(
          "ambient-orb ambient-orb-c absolute rounded-full blur-3xl",
          intensity === "soft" ? "opacity-25" : "opacity-45"
        )}
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}

export { AmbientField }
