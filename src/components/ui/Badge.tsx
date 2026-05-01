import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        outline: "border-border text-foreground",
        success: "border-transparent bg-brand-500/15 text-brand-500",
        warning: "border-transparent bg-amber-500/15 text-amber-400",
        info: "border-transparent bg-blue-500/15 text-blue-400",
        neutral: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export const BADGE_MAP = {
  Occupied: "destructive",
  Vacant: "success",
  Open: "destructive",
  "In Progress": "warning",
  Resolved: "success",
  Closed: "neutral",
  New: "info",
  Responded: "success",
  High: "destructive",
  Medium: "warning",
  Low: "info",
  Paid: "success",
  Pending: "warning",
} as const

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? <span className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
export default Badge
