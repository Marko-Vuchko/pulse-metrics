import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full max-w-xl rounded-2xl" />
    </div>
  )
}
