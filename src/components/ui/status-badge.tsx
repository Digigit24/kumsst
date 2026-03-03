import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  LucideIcon,
  MinusCircle,
  XCircle,
} from "lucide-react"
import * as React from "react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      status: {
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        published: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        excused: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      status: "inactive",
      size: "default",
    },
  }
)

// Map status to icons
const statusIcons: Record<string, LucideIcon> = {
  active: CheckCircle,
  inactive: MinusCircle,
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
  pending: Clock,
  processing: Loader2,
  cancelled: XCircle,
  paid: CheckCircle,
  unpaid: XCircle,
  partial: AlertCircle,
  overdue: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  draft: MinusCircle,
  published: CheckCircle,
  present: CheckCircle,
  absent: XCircle,
  late: Clock,
  excused: AlertCircle,
}

// Map common boolean/string values to status
export const mapToStatus = (value: boolean | string | null | undefined): string => {
  if (typeof value === 'boolean') {
    return value ? 'active' : 'inactive'
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim()
    // Direct matches
    if (normalized in statusIcons) return normalized
    // Common aliases
    if (['true', 'yes', 'enabled', 'on', 'complete', 'completed'].includes(normalized)) return 'active'
    if (['false', 'no', 'disabled', 'off'].includes(normalized)) return 'inactive'
    if (['fail', 'failed', 'failure'].includes(normalized)) return 'error'
    if (['warn'].includes(normalized)) return 'warning'
    if (['wait', 'waiting', 'queued'].includes(normalized)) return 'pending'
    if (['in_progress', 'running', 'loading'].includes(normalized)) return 'processing'
  }
  return 'inactive'
}

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
  Omit<VariantProps<typeof statusBadgeVariants>, 'status'> {
  /** The status to display - can be a predefined status or boolean */
  status?: keyof typeof statusIcons | boolean | string | null
  /** Custom label (defaults to capitalized status) */
  label?: string
  /** Show icon before label */
  showIcon?: boolean
  /** Pulse animation for processing/pending states */
  pulse?: boolean
}

function StatusBadge({
  className,
  status = 'inactive',
  size,
  label,
  showIcon = true,
  pulse = false,
  ...props
}: StatusBadgeProps) {
  // Normalize status
  const normalizedStatus = typeof status === 'string'
    ? (status.toLowerCase() as keyof typeof statusIcons)
    : mapToStatus(status)

  // Get icon component
  const Icon = statusIcons[normalizedStatus] || MinusCircle
  const isAnimated = pulse || normalizedStatus === 'processing'

  // Generate label
  const displayLabel = label || normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1).replace(/_/g, ' ')

  return (
    <div
      className={cn(
        statusBadgeVariants({ status: normalizedStatus as any, size }),
        className
      )}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn(
            "h-3 w-3 shrink-0",
            isAnimated && "animate-spin"
          )}
        />
      )}
      <span>{displayLabel}</span>
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
