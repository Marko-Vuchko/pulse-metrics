"use client"

import { Reveal } from "@/components/motion/reveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is PulseMetrics?",
    answer:
      "PulseMetrics is a portfolio SaaS analytics shell from Fluxis Labs. It demonstrates auth, dashboard UX, seeded metrics, and customer management on Next.js and hosted Supabase.",
  },
  {
    question: "How do I try the demo?",
    answer:
      "Scroll to the Demo credentials section, copy the email and password, then open Log in. The seeded account includes ~90 days of metrics and about 25 customers.",
  },
  {
    question: "Is there a real payment or Stripe integration?",
    answer:
      "No. Landing pricing and the in-app Billing page are intentional demo surfaces. Fake checkout persists a plan on your profile - no Stripe, charges, or webhooks.",
  },
  {
    question: "Do team invites share my workspace?",
    answer:
      "No. Invites are stored for the owner tenant as a showcase. Accepting an invite does not grant another account RLS access. Shared workspaces are a documented v2 path.",
  },
  {
    question: "Do I need Docker or a local database?",
    answer:
      "No. PulseMetrics uses a hosted Supabase project. Local Docker and supabase start are intentionally out of scope.",
  },
  {
    question: "How does email confirmation work?",
    answer:
      "Signup sends a confirmation link to a real inbox via hosted Supabase Auth. Unconfirmed accounts cannot sign in until the link is opened.",
  },
  {
    question: "Is Google sign-in available?",
    answer:
      "By default the Google button opens an intentional setup checklist. Live OAuth is optional via NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED after you enable the provider in Supabase. Email/password is the demo path.",
  },
  {
    question: "Are notifications real?",
    answer:
      "Yes. Customer and metrics actions write rows to a tenant-scoped notifications table (with created_at / read_at). The topbar bell reads those rows under RLS.",
  },
  {
    question: "What data will I see after login?",
    answer:
      "The demo user sees Overview KPIs, an MRR chart, Analytics charts, and a customers table. New signups start empty until they create their own records.",
  },
  {
    question: "Can I delete customers permanently?",
    answer:
      "Delete soft-archives a customer. Archived rows are hidden from the default list. There is no restore flow in v1.",
  },
  {
    question: "Which date ranges are supported?",
    answer:
      "Overview and Analytics share 7d, 30d, and 90d ranges via the ?range= URL parameter.",
  },
  {
    question: "Who built this and how do I contact Fluxis Labs?",
    answer:
      "PulseMetrics is built by Fluxis Labs. For portfolio questions, email fluxislabs@gmail.com or visit the GitHub profile linked in the footer.",
  },
] as const

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
            FAQ
          </p>
          <h2 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Answers before you sign in
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Quick clarifications about the demo, auth, and intentional demo surfaces.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="mt-10">
          <Accordion className="border-border/80 bg-card/30">
            {faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger className="font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}

export { Faq }
