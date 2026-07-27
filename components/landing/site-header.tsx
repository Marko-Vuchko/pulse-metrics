"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Logo } from "@/components/landing/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", id: "features", label: "Features" },
  { href: "#pricing", id: "pricing", label: "Pricing" },
  { href: "#faq", id: "faq", label: "FAQ" },
  { href: "#demo-credentials", id: "demo-credentials", label: "Demo" },
] as const

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.id)

    function onScroll() {
      const nextScrolled = window.scrollY > 12
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))

      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const nextProgress =
        max > 0 ? Math.min(1, window.scrollY / max) : 0
      setProgress((prev) =>
        Math.abs(prev - nextProgress) < 0.001 ? prev : nextProgress
      )

      let current: string | null = null
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= 120) current = id
      }
      setActiveId((prev) => (prev === current ? prev : current))
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,backdrop-filter,border-color] duration-300",
        scrolled
          ? "border-border/80 bg-background/85 backdrop-blur-xl"
          : "border-border/60 bg-background/75 backdrop-blur-md"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary/80 motion-safe:transition-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="PulseMetrics home">
          <Logo />
        </Link>

        <nav
          aria-label="Marketing"
          className="hidden items-center gap-6 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm transition-colors",
                activeId === link.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              <span
                aria-hidden
                className={cn(
                  "absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary motion-safe:transition-opacity",
                  activeId === link.id ? "opacity-100" : "opacity-0"
                )}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex"
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "sm" }), "landing-cta-pulse")}
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
