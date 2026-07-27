import Link from "next/link"

import { Logo } from "@/components/landing/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="bg-atmosphere relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.35_0.1_210/0.28),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04] dark:opacity-[0.07]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40"
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16 text-center outline-none"
      >
        <Link href="/" aria-label="PulseMetrics home">
          <Logo />
        </Link>

        <p className="mt-10 font-mono text-xs tracking-[0.2em] text-primary uppercase">
          404
        </p>
        <h1 className="mt-3 max-w-md font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Signal lost
        </h1>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground text-pretty">
          That route is outside the PulseMetrics grid. Head home or open the
          dashboard if you already have an account.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            Back to home
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Log in
          </Link>
        </div>

        <p className="mt-12 font-mono text-xs text-muted-foreground">
          Built by Fluxis Labs
        </p>
      </main>
    </div>
  )
}
