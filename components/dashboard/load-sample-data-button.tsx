"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Database } from "lucide-react"
import { toast } from "sonner"

import { loadSampleData } from "@/app/actions/sample-data"
import { Button } from "@/components/ui/button"

type LoadSampleDataButtonProps = {
  variant?: "default" | "outline" | "secondary"
  className?: string
}

export function LoadSampleDataButton({
  variant = "default",
  className,
}: LoadSampleDataButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await loadSampleData()
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success(
            `Loaded ${result.customers} customers and ${result.metrics} metric days.`
          )
          router.refresh()
        })
      }}
    >
      <Database data-icon="inline-start" />
      {pending ? "Loading sample..." : "Load demo sample data"}
    </Button>
  )
}
