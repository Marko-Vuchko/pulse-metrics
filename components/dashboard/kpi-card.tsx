import { TrendingDown, TrendingUp } from "lucide-react"

import { CountUp } from "@/components/motion/count-up"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn, formatDeltaPercent } from "@/lib/utils"
import type { KpiCardData } from "@/types/metrics"

const KPI_STAGGER_MS = 60

function trendTone(
  deltaPct: number,
  inverted: boolean
): "positive" | "negative" | "neutral" {
  if (deltaPct === 0) return "neutral"
  const isFavorable = inverted ? deltaPct < 0 : deltaPct > 0
  return isFavorable ? "positive" : "negative"
}

type KpiCardProps = {
  kpi: KpiCardData
  index?: number
}

export function KpiCard({ kpi, index = 0 }: KpiCardProps) {
  const tone =
    kpi.deltaPct === null ? "neutral" : trendTone(kpi.deltaPct, kpi.inverted)
  const rising = (kpi.deltaPct ?? 0) > 0

  return (
    <Card
      size="sm"
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both border-border/60 bg-card/80 backdrop-blur-sm"
      style={{ animationDelay: `${index * KPI_STAGGER_MS}ms` }}
    >
      <CardHeader className="gap-1">
        <CardDescription className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          {kpi.label}
        </CardDescription>
        <CardTitle className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
          <CountUp value={kpi.value} format={kpi.format} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {kpi.deltaPct === null ? (
          <p className="font-mono text-xs text-muted-foreground">
            No prior period
          </p>
        ) : (
          <p
            className={cn(
              "inline-flex items-center gap-1 font-mono text-xs tabular-nums",
              tone === "positive" && "text-success",
              tone === "negative" && "text-destructive",
              tone === "neutral" && "text-muted-foreground"
            )}
          >
            {rising ? (
              <TrendingUp className="size-3.5" aria-hidden />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden />
            )}
            <span>{formatDeltaPercent(kpi.deltaPct)}</span>
            <span className="text-muted-foreground">vs 7d ago</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

type KpiGridProps = {
  kpis: KpiCardData[]
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <KpiCard key={kpi.key} kpi={kpi} index={index} />
      ))}
    </div>
  )
}
