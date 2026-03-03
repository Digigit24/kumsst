import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("relative overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800", className)}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-300/80 dark:via-white/20 to-transparent" />
        </div>
    )
}

function SkeletonText({
    className,
    lines = 1,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
    if (lines === 1) {
        return (
            <div
                className={cn("h-4 relative overflow-hidden rounded bg-slate-200 dark:bg-slate-800", className)}
                {...props}
            >
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-300/80 dark:via-white/20 to-transparent" />
            </div>
        )
    }

    return (
        <div className={cn("space-y-2", className)} {...props}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-4 relative overflow-hidden rounded bg-slate-200 dark:bg-slate-800",
                        i === lines - 1 && "w-4/5" // Last line is shorter
                    )}
                >
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-300/80 dark:via-white/20 to-transparent" />
                </div>
            ))}
        </div>
    )
}

function SkeletonDropdown({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "h-10 w-full relative overflow-hidden rounded-md border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-300/90 dark:via-white/20 to-transparent" />
        </div>
    )
}

function SkeletonOption({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex items-center gap-3 p-2", className)} {...props}>
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="flex-1 space-y-1.5">
                <SkeletonText className="w-3/4" />
                <SkeletonText className="w-1/2 h-3" />
            </div>
        </div>
    )
}

export { Skeleton, SkeletonText, SkeletonDropdown, SkeletonOption }
