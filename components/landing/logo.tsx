import Image from "next/image"

import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  markClassName?: string
  showWordmark?: boolean
}

function Logo({
  className,
  markClassName,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-mark.svg"
        alt=""
        width={28}
        height={28}
        unoptimized
        className={cn("size-7 shrink-0", markClassName)}
        aria-hidden
      />
      {showWordmark ? (
        <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
          PulseMetrics
        </span>
      ) : null}
    </span>
  )
}

export { Logo }
