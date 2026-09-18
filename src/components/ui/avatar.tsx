"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/cn"

// docs/03 section 5 "Avatars": circular, initials fallback on a deterministic pastel from the
// token set (the pastel is chosen by the caller - e.g. a rotation over the *-soft tokens - and
// passed as AvatarFallback className, matching src/app/design-system's own table example).
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex size-8 shrink-0 rounded-pill select-none after:absolute after:inset-0 after:rounded-pill after:border after:border-border data-[size=lg]:size-10 data-[size=sm]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-pill object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-pill bg-surface-muted text-xs font-semibold text-text-secondary tabular-nums",
        className
      )}
      {...props}
    />
  )
}

// docs/03 section 5: "AvatarGroup overlaps at -8px with a white 2px ring and a +N counter chip."
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-surface",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-pill bg-surface-muted text-xs font-semibold text-text-secondary tabular-nums ring-2 ring-surface",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount }
