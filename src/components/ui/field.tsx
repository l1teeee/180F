"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Form composition primitives (shadcn's modern replacement for the old form.tsx react-hook-form
// wrapper - this registry ships no standalone "form" component, see the handoff notes). Pair
// these with react-hook-form's own useFormContext/Controller; nothing here is framework-bound.

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-semibold text-ink data-[variant=label]:text-sm data-[variant=legend]:text-[15px]",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-5", className)}
      {...props}
    />
  )
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-danger-text", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full",
      horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start",
      responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-0.5 leading-snug", className)}
      {...props}
    />
  )
}

// Wraps a checkbox/radio so the whole row is a clickable target with the same field-label look
// used elsewhere - a bordered field becomes a 12px-radius (--radius-field) selectable row.
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-field has-[>[data-slot=field]]:border has-[>[data-slot=field]]:border-border has-[>[data-slot=field]]:p-2.5 has-[>[data-slot=field]]:not-has-[:disabled]:hover:bg-surface-muted has-data-checked:border-purple-deep/30 has-data-checked:bg-purple-xsoft",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-semibold text-ink group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal text-text-secondary last:mt-0 [&>a]:text-purple-deep [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { children?: React.ReactNode }) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn("relative -my-2 h-5 text-sm", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          data-slot="field-separator-content"
          className="relative mx-auto block w-fit bg-surface px-2 text-text-secondary"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = React.useMemo(() => {
    if (children) return children
    if (!errors?.length) return null

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]
    if (uniqueErrors.length === 1) return uniqueErrors[0]?.message

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) => error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) return null

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-medium text-danger-text", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
