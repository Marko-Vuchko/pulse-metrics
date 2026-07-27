import { Suspense } from "react"
import { notFound } from "next/navigation"

import { CustomerDetailWorkspace } from "@/components/dashboard/customer-detail-workspace"
import { CustomersSkeleton } from "@/components/dashboard/customers-skeleton"
import { SectionErrorRetry } from "@/components/dashboard/section-error-retry"
import { ContentFade } from "@/components/motion/content-fade"
import {
  buildCustomerActivityTimeline,
  getCustomerActivityTimeline,
} from "@/lib/data/customer-activity"
import { getCustomerById } from "@/lib/data/customers"
import { isE2EMockSession } from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CustomerDetailPageProps) {
  const { id } = await params
  try {
    const customer = await getCustomerById(id)
    if (!customer) {
      return { title: "Customer" }
    }
    return {
      title: customer.name,
      description: `Customer detail and activity for ${customer.name}.`,
    }
  } catch {
    return { title: "Customer" }
  }
}

async function CustomerDetailContent({
  params,
}: {
  params: CustomerDetailPageProps["params"]
}) {
  const { id } = await params

  let customer
  try {
    customer = await getCustomerById(id)
  } catch {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Customer
          </h2>
          <p className="text-sm text-muted-foreground">
            Detail view and activity timeline.
          </p>
        </div>
        <SectionErrorRetry
          title="Couldn't load customer"
          description="This customer failed to load. Retry to fetch the latest details."
        />
      </div>
    )
  }

  if (!customer) {
    notFound()
  }

  let events = buildCustomerActivityTimeline(customer)

  if (!(await isE2EMockSession())) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      events = await getCustomerActivityTimeline(supabase, {
        tenantId: user.id,
        customer,
      })
    }
  }

  return <CustomerDetailWorkspace customer={customer} events={events} />
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <ContentFade>
        <CustomerDetailContent params={params} />
      </ContentFade>
    </Suspense>
  )
}
