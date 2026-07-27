import { Skeleton } from "@/components/ui/skeleton"

export default function MetricsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-72 w-full max-w-2xl rounded-2xl" />
    </div>
  )
}
