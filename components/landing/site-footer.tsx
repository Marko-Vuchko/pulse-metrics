import Link from "next/link"

import { Logo } from "@/components/landing/logo"

function SiteFooter() {
  return (
    <footer className="border-t border-border/70 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground text-pretty">
            Premium SaaS analytics dashboard for indie hackers and small
            businesses.
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Built by Fluxis Labs
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <a
            href="https://github.com/Marko-Vuchko"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border/60 pt-6">
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 PulseMetrics. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export { SiteFooter }
