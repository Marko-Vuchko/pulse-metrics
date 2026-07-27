"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpenIcon, CheckIcon, CreditCardIcon } from "lucide-react"
import { toast } from "sonner"

import { updateBillingPlan } from "@/app/actions/billing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { BILLING_TIERS, getBillingTier } from "@/lib/billing/plans"
import { cn } from "@/lib/utils"
import { checkoutSchema, type CheckoutInput } from "@/types/billing"
import type { PlanName } from "@/types/customers"

type BillingWorkspaceProps = {
  currentPlan: PlanName
}

const STRIPE_CHECKOUT_SNIPPET = `// Server Action sketch (not wired in this demo)
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function startCheckout(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?ok=1\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=1\`,
    client_reference_id: user.id, // map back to tenant
  })
  redirect(session.url!)
}

// Webhook: checkout.session.completed → update profiles.billing_plan
// Also add Customer Portal for cancellations / invoices.`

export function BillingWorkspace({ currentPlan }: BillingWorkspaceProps) {
  const [selected, setSelected] = useState<PlanName | null>(null)
  const [open, setOpen] = useState(false)
  const [stripeOpen, setStripeOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const activeTier = getBillingTier(currentPlan)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      plan: currentPlan,
      cardholder: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  })

  function openCheckout(plan: PlanName) {
    if (plan === currentPlan) {
      toast.message(`${plan} is already your plan`)
      return
    }
    setSelected(plan)
    reset({
      plan,
      cardholder: "",
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvc: "123",
    })
    setOpen(true)
  }

  function onSubmit(values: CheckoutInput) {
    startTransition(async () => {
      const result = await updateBillingPlan(values)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CheckoutInput, { message: messages[0] })
          }
        }
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success(`Switched to ${result.plan} (demo checkout)`)
        setOpen(false)
        setSelected(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-3xl border-primary/25 bg-primary/5">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex flex-wrap items-center gap-2">
              Current plan
              <Badge className="font-mono">{currentPlan}</Badge>
            </CardTitle>
            <CardDescription>
              {activeTier.priceLabel}/mo showcase subscription. No Stripe, no
              real charges - card fields are demo-only.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setStripeOpen(true)}
          >
            <BookOpenIcon className="size-4" aria-hidden />
            How Stripe would wire
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {BILLING_TIERS.map((tier) => {
          const isCurrent = tier.name === currentPlan
          return (
            <Card
              key={tier.name}
              className={cn(
                "flex flex-col",
                tier.highlighted && "border-primary/40",
                isCurrent && "ring-1 ring-primary/40"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-mono text-lg">{tier.name}</CardTitle>
                  {isCurrent ? (
                    <Badge variant="secondary">Current</Badge>
                  ) : tier.highlighted ? (
                    <Badge>Recommended</Badge>
                  ) : null}
                </div>
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {tier.priceLabel}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / mo
                  </span>
                </p>
                <CardDescription>{tier.blurb}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckIcon
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => openCheckout(tier.name)}
                >
                  {isCurrent ? "Active plan" : `Choose ${tier.name}`}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCardIcon className="size-4" aria-hidden />
              Demo checkout
            </DialogTitle>
            <DialogDescription>
              Fake payment for {selected ?? "plan"}. Nothing is charged - this
              only updates your workspace billing plan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <input type="hidden" {...register("plan")} />
            <FieldGroup className="gap-3">
              <Field data-invalid={!!errors.cardholder || undefined}>
                <FieldLabel htmlFor="cardholder">Cardholder</FieldLabel>
                <Input
                  id="cardholder"
                  autoComplete="cc-name"
                  placeholder="Demo User"
                  disabled={isPending}
                  aria-invalid={!!errors.cardholder}
                  {...register("cardholder")}
                />
                <FieldError errors={[errors.cardholder]} />
              </Field>
              <Field data-invalid={!!errors.cardNumber || undefined}>
                <FieldLabel htmlFor="cardNumber">Card number</FieldLabel>
                <Input
                  id="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  disabled={isPending}
                  aria-invalid={!!errors.cardNumber}
                  {...register("cardNumber")}
                />
                <FieldDescription>
                  Use any 16 digits (prefilled demo Visa-style number).
                </FieldDescription>
                <FieldError errors={[errors.cardNumber]} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!errors.expiry || undefined}>
                  <FieldLabel htmlFor="expiry">Expiry</FieldLabel>
                  <Input
                    id="expiry"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    disabled={isPending}
                    aria-invalid={!!errors.expiry}
                    {...register("expiry")}
                  />
                  <FieldError errors={[errors.expiry]} />
                </Field>
                <Field data-invalid={!!errors.cvc || undefined}>
                  <FieldLabel htmlFor="cvc">CVC</FieldLabel>
                  <Input
                    id="cvc"
                    autoComplete="cc-csc"
                    placeholder="123"
                    disabled={isPending}
                    aria-invalid={!!errors.cvc}
                    {...register("cvc")}
                  />
                  <FieldError errors={[errors.cvc]} />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Confirming..." : `Confirm ${selected}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={stripeOpen} onOpenChange={setStripeOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>How this would wire to Stripe Checkout</DialogTitle>
            <DialogDescription>
              Intentional demo boundary: PulseMetrics keeps fake checkout so the
              portfolio stays free to explore. Production wiring would look like
              this sketch.
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Map each plan to a Stripe Price ID in env or a prices table.</li>
            <li>
              Server Action creates a Checkout Session and redirects to
              `session.url`.
            </li>
            <li>
              Webhook `checkout.session.completed` updates
              `profiles.billing_plan` for the tenant.
            </li>
            <li>
              Customer Portal handles upgrades, invoices, and cancellation UX.
            </li>
          </ol>
          <pre className="max-h-64 overflow-auto rounded-xl border border-border/70 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground">
            {STRIPE_CHECKOUT_SNIPPET}
          </pre>
          <DialogFooter>
            <Button type="button" onClick={() => setStripeOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
