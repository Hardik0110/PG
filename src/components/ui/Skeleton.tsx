import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/* Legacy helpers kept so older pages keep rendering */
export function SkeletonText({ width = "100%", height = 16, lines = 1 }: { width?: string | number; height?: string | number; lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} style={{ width, height }} />
      ))}
    </div>
  )
}

export function SkeletonBox({ width = "100%", height = 100 }: { width?: string | number; height?: string | number }) {
  return <Skeleton style={{ width, height }} />
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton className="rounded-full" style={{ width: size, height: size }} />
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 px-4 py-3 border-b border-border">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Skeleton }
export default Skeleton
