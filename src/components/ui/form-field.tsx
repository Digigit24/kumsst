import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export interface FormFieldProps {
  /** Field name/id for accessibility */
  name: string
  /** Label text */
  label?: string
  /** Error message to display */
  error?: string
  /** Helper text shown below the field */
  helperText?: string
  /** Whether the field is required */
  required?: boolean
  /** Additional className for the container */
  className?: string
  /** The form input element */
  children: React.ReactNode
}

/**
 * FormField wrapper component
 * Provides consistent label, error, and helper text display
 *
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   label="Email Address"
 *   error={errors.email?.message}
 *   required
 * >
 *   <Input
 *     id="email"
 *     type="email"
 *     {...register('email')}
 *   />
 * </FormField>
 * ```
 */
export function FormField({
  name,
  label,
  error,
  helperText,
  required,
  className,
  children,
}: FormFieldProps) {
  const hasError = Boolean(error)

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            "text-sm font-medium",
            hasError && "text-destructive"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}

      {/* Wrap children to add error styling context */}
      <div className={cn(hasError && "[&>*]:border-destructive [&>*]:focus-visible:ring-destructive")}>
        {children}
      </div>

      {/* Error message */}
      {hasError && (
        <div
          className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text (only shown when no error) */}
      {helperText && !hasError && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

/**
 * Standalone error message component
 * Use when you need error display without the full FormField wrapper
 *
 * @example
 * ```tsx
 * <Input {...register('name')} />
 * <FormError error={errors.name?.message} />
 * ```
 */
export function FormError({ error, className }: { error?: string; className?: string }) {
  if (!error) return null

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{error}</span>
    </div>
  )
}

/**
 * Form section header
 * Use to group related fields with a title and optional description
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default FormField
