import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PulseMetrics privacy policy stub. How Fluxis Labs handles product data and contact.",
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This is a placeholder privacy policy for PulseMetrics, a product of
        Fluxis Labs. It is not legal advice and will be replaced with counsel-
        reviewed copy before production use beyond portfolio demos.
      </p>
      <p>
        PulseMetrics stores account credentials and product data you enter in
        the app (such as customer records and analytics settings) so you can use
        the dashboard. Authentication is handled by our hosted Supabase project.
      </p>
      <p>
        We do not sell personal data. Access to tenant data is scoped to your
        account via row-level security. Demo environments may include seeded
        sample data that is not tied to real customers.
      </p>
      <p>
        If you need data deletion, export, or have a privacy request, email us
        at the address below. We will respond as soon as practical.
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Last updated: 23 Jul 2026
      </p>
    </LegalPage>
  )
}
