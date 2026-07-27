import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "PulseMetrics terms of service stub. Usage terms for the Fluxis Labs product.",
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These are placeholder terms for PulseMetrics, a product of Fluxis Labs.
        They are not legal advice and will be replaced with counsel-reviewed
        terms before production use beyond portfolio demos.
      </p>
      <p>
        By using PulseMetrics you agree to use the service lawfully, keep your
        credentials secure, and not attempt to access another tenant&apos;s
        data. The product is provided as-is for demonstration and early use.
      </p>
      <p>
        Fluxis Labs may update features, rate limits, or availability without
        notice while the product is in active development. Paid billing is not
        part of the current release.
      </p>
      <p>
        Demo credentials and seeded data are for evaluation only. Do not upload
        sensitive production data you are not authorized to process.
      </p>
      <p>
        For questions about these terms, contact us at the address below.
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Last updated: 23 Jul 2026
      </p>
    </LegalPage>
  )
}
