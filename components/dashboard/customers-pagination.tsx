import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  buildCustomersReturnPath,
  type CustomerSort,
  type CustomerSortDir,
  type CustomerStatusFilter,
} from "@/types/customers"

type CustomersPaginationProps = {
  page: number
  pageCount: number
  q: string
  status: CustomerStatusFilter
  sort: CustomerSort
  dir: CustomerSortDir
}

export function CustomersPagination({
  page,
  pageCount,
  q,
  status,
  sort,
  dir,
}: CustomersPaginationProps) {
  if (pageCount <= 1) return null

  const prevDisabled = page <= 1
  const nextDisabled = page >= pageCount

  function hrefFor(nextPage: number) {
    return buildCustomersReturnPath({
      q,
      status,
      page: nextPage,
      sort,
      dir,
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-mono text-xs text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50"
            )}
            aria-disabled="true"
          >
            <ChevronLeft data-icon="inline-start" />
            Prev
          </span>
        ) : (
          <Link
            href={hrefFor(page - 1)}
            scroll={false}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeft data-icon="inline-start" />
            Prev
          </Link>
        )}
        {nextDisabled ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50"
            )}
            aria-disabled="true"
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </span>
        ) : (
          <Link
            href={hrefFor(page + 1)}
            scroll={false}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </Link>
        )}
      </div>
    </div>
  )
}
