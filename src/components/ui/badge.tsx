import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/20",

        secondary:
          "border-transparent bg-muted text-muted-foreground dark:bg-muted/60 dark:text-muted-foreground hover:bg-muted/80",

        destructive:
          "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive hover:bg-destructive/20",

        outline:
          "border border-border text-foreground dark:border-border/60 hover:bg-accent",

        success:
          "border border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",

        warning:
          "border border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20",
        info:
          "border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

