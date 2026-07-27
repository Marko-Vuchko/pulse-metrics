import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type DemoSurfaceNoteProps = {
  title?: string
  children: React.ReactNode
  className?: string
}

/** Intentional portfolio-scope callout (not an unfinished feature warning). */
function DemoSurfaceNote({
  title = "Demo surface",
  children,
  className,
}: DemoSurfaceNoteProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-start sm:gap-3",
        className
      )}
    >
      <Badge variant="outline" className="w-fit shrink-0 font-mono text-[10px]">
        {title}
      </Badge>
      <p className="text-sm text-muted-foreground text-pretty">{children}</p>
    </div>
  )
}

export { DemoSurfaceNote }
