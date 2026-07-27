import dynamic from "next/dynamic"

import { DemoCredentials } from "@/components/landing/demo-credentials"
import { Faq } from "@/components/landing/faq"
import { Features } from "@/components/landing/features"
import { Hero } from "@/components/landing/hero"
import { Pricing } from "@/components/landing/pricing"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"

// Defer ambient canvas + below-fold islands; hero preview ships with the first paint.
const AmbientField = dynamic(() =>
  import("@/components/landing/ambient-field").then((mod) => ({
    default: mod.AmbientField,
  }))
)

const Testimonials = dynamic(
  () =>
    import("@/components/landing/testimonials").then((mod) => ({
      default: mod.Testimonials,
    })),
  {
    loading: () => (
      <div className="mx-auto h-56 max-w-4xl animate-pulse rounded-2xl bg-muted/30" />
    ),
  }
)

export default function Home() {
  return (
    <div className="bg-atmosphere relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.035] dark:opacity-[0.06]"
      />
      <AmbientField className="z-[1]" />

      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          <Hero />
          <Features />
          <Pricing />
          <Faq />
          <Testimonials />
          <DemoCredentials />
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
