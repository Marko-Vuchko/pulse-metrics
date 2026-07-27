import { BillingWorkspace } from "@/components/dashboard/billing-workspace"
import { DemoSurfaceNote } from "@/components/dashboard/demo-surface-note"
import { ContentFade } from "@/components/motion/content-fade"
import { getProfile } from "@/lib/data/profile"
import type { PlanName } from "@/types/customers"

export const metadata = {
  title: "Billing",
  description: "PulseMetrics billing showcase - demo checkout without Stripe.",
}

export default async function BillingPage() {
  const profile = await getProfile()
  const currentPlan = (profile?.billing_plan ?? "Basic") as PlanName

  return (
    <ContentFade>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Billing
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Showcase checkout for portfolio walkthroughs. Selected plan persists
            on your profile - no payment provider is connected.
          </p>
        </div>

        <DemoSurfaceNote>
          Intentional demo: card fields update `billing_plan` only. No Stripe
          Checkout, webhooks, or real charges. Open &quot;How Stripe would wire&quot;
          for the Checkout + webhook sketch kept out of this demo on purpose.
        </DemoSurfaceNote>

        <BillingWorkspace currentPlan={currentPlan} />
      </div>
    </ContentFade>
  )
}
