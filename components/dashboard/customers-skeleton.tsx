import { Skeleton } from "@/components/ui/skeleton"

export function CustomersSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-32 rounded-2xl" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-64 rounded-2xl" />
        <Skeleton className="h-8 w-36 rounded-2xl" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <div className="border-b border-border/60 bg-muted/30 px-3 py-3">
          <div className="flex gap-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-16" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex gap-6 px-3 py-3">
              {Array.from({ length: 7 }).map((__, cell) => (
                <Skeleton key={cell} className="h-4 w-20" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
