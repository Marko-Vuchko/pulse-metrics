import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  CustomerSort,
  CustomerSortDir,
  CustomerStatusFilter,
} from "@/types/customers"

type CustomersSearchProps = {
  q: string
  status: CustomerStatusFilter
  sort: CustomerSort
  dir: CustomerSortDir
}

export function CustomersSearch({
  q,
  status,
  sort,
  dir,
}: CustomersSearchProps) {
  return (
    <form
      action="/dashboard/customers"
      method="get"
      className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-sm"
      role="search"
    >
      {status !== "all" ? (
        <input type="hidden" name="status" value={status} />
      ) : null}
      {sort !== "created_at" ? (
        <input type="hidden" name="sort" value={sort} />
      ) : null}
      {dir !== "desc" ? <input type="hidden" name="dir" value={dir} /> : null}
      <div className="relative min-w-0 flex-1">
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          aria-label="Search customers by name or email"
          className="pr-9"
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Search"
        >
          <Search />
        </Button>
      </div>
    </form>
  )
}
