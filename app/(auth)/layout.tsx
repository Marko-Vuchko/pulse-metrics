import Link from "next/link"

import { AmbientField } from "@/components/landing/ambient-field"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-atmosphere relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.08_210/0.35),transparent_55%),linear-gradient(180deg,oklch(0.16_0.02_250),oklch(0.12_0.015_250))] dark:opacity-100 opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04] dark:opacity-[0.07]"
      />
      <AmbientField className="z-[1]" intensity="soft" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight text-primary"
        >
          PulseMetrics
        </Link>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 outline-none"
      >
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  )
}
