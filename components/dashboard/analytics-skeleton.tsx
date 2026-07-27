import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-36 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/60 bg-card/80">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-[16/9] w-full min-h-[180px] rounded-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
