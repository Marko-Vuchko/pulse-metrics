import type { ReactNode } from "react"
import Link from "next/link"

import { AmbientField } from "@/components/landing/ambient-field"
import { Logo } from "@/components/landing/logo"
import { SiteFooter } from "@/components/landing/site-footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CONTACT_EMAIL = "fluxislabs@gmail.com"

type LegalPageProps = {
  title: string
  children: ReactNode
}

function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="bg-atmosphere relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.035] dark:opacity-[0.06]"
      />
      <AmbientField className="z-[1]" intensity="soft" />

      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" aria-label="PulseMetrics home">
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 outline-none sm:px-6 sm:py-16"
        >
          <p className="font-mono text-xs tracking-wide text-primary uppercase">
            Fluxis Labs
          </p>
          <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground text-pretty">
            {children}
          </div>
          <p className="mt-10 rounded-2xl border border-border/70 bg-card/40 px-4 py-3 text-sm text-foreground">
            Questions? Contact{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-mono text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

export { LegalPage, CONTACT_EMAIL }
