import { Suspense } from "react"

import { CustomersSkeleton } from "@/components/dashboard/customers-skeleton"
import { CustomersWorkspace } from "@/components/dashboard/customers-workspace"
import { SectionErrorRetry } from "@/components/dashboard/section-error-retry"
import { ContentFade } from "@/components/motion/content-fade"
import {
  listCustomers,
  parseCustomerSort,
  parseCustomerSortDir,
  parseCustomerStatusFilter,
  parseCustomersPage,
} from "@/lib/data/customers"

export const metadata = {
  title: "Customers",
  description: "PulseMetrics customers - search, filter, and manage.",
}

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
    sort?: string
    dir?: string
    edit?: string
    create?: string
  }>
}

async function CustomersContent({
  searchParams,
}: {
  searchParams: CustomersPageProps["searchParams"]
}) {
  const params = await searchParams
  const q = params.q ?? ""
  const status = parseCustomerStatusFilter(params.status)
  const page = parseCustomersPage(params.page)
  const sort = parseCustomerSort(params.sort)
  const dir = parseCustomerSortDir(params.dir)

  let result
  try {
    result = await listCustomers({ q, status, page, sort, dir })
  } catch {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Customers
          </h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage your customer list.
          </p>
        </div>
        <SectionErrorRetry
          title="Couldn't load customers"
          description="The customers table failed to load. Retry to fetch the latest rows."
        />
      </div>
    )
  }

  return (
    <CustomersWorkspace
      result={result}
      initialCreate={params.create === "1"}
      initialEditId={params.edit ?? null}
    />
  )
}

export default function CustomersPage({ searchParams }: CustomersPageProps) {
  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <ContentFade>
        <CustomersContent searchParams={searchParams} />
      </ContentFade>
    </Suspense>
  )
}
