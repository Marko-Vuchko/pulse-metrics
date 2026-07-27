import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function OverviewSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            size="sm"
            className="border-border/60 bg-card/80"
          >
            <CardHeader className="gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-28 rounded-2xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-[16/7] w-full min-h-[240px] rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  )
}
