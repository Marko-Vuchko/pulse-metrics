"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Reveal } from "@/components/motion/reveal"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEMO_EMAIL = "demo@fluxislabs.com"
const DEMO_PASSWORD = "fluxis-demo-2026"

function DemoCredentials() {
  const [copied, setCopied] = useState<"email" | "password" | null>(null)

  async function copyValue(value: string, kind: "email" | "password") {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      toast.success(kind === "email" ? "Email copied" : "Password copied")
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  return (
    <section
      id="demo-credentials"
      className="scroll-mt-24 px-4 py-20 sm:px-6"
      aria-labelledby="demo-heading"
    >
      <Reveal className="mx-auto max-w-3xl rounded-[1.75rem] border border-primary/30 bg-primary/5 p-6 sm:p-10">
        <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
          Demo credentials
        </p>
        <h2
          id="demo-heading"
          className="mt-3 font-mono text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Open the live dashboard
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
          Use the seeded account to explore KPIs, charts, and customers. No
          signup required for the portfolio walkthrough.
        </p>

        <div className="mt-8 space-y-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <dl>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Email
              </dt>
              <dd className="mt-1 font-mono text-sm sm:text-base">{DEMO_EMAIL}</dd>
            </dl>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyValue(DEMO_EMAIL, "email")}
              aria-label="Copy demo email"
            >
              {copied === "email" ? <CheckIcon /> : <CopyIcon />}
              Copy
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <dl>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Password
              </dt>
              <dd className="mt-1 font-mono text-sm sm:text-base">
                {DEMO_PASSWORD}
              </dd>
            </dl>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyValue(DEMO_PASSWORD, "password")}
              aria-label="Copy demo password"
            >
              {copied === "password" ? <CheckIcon /> : <CopyIcon />}
              Copy
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "landing-cta-pulse min-w-40"
            )}
          >
            Log in to demo
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-w-40"
            )}
          >
            Create your account
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

export { DemoCredentials }
