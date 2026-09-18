"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { blobatarUri } from "blobatar/uri"
import { Blobatar as BlobatarSvg } from "blobatar/react"
// Required for animate="hover" to actually animate - blobatar/react renders nothing without it
// (blobatar README "Animation"). Imported once here since every blobatar in the app renders
// through this file; package.json marks "*.css" as a side effect so bundlers keep it.
import "blobatar/motion.css"

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

// docs/03 section 13 "Avatars", ADR-021. bg/head/eye hex - src/lib/avatar.ts is the only place
// that constructs one of these; every blobatar-rendering component here just takes the result.
export interface BlobatarPalette {
  bg: string
  head: string
  eye: string
}

// Catches a render-time throw from the animated (inline SVG) path only - the static path below
// calls blobatarUri() directly, a plain function a try/catch already covers. A component error
// cannot be caught by wrapping its JSX in try/catch (the throw happens later, during React's own
// render pass), which is what an error boundary is for.
class BlobatarErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state: { failed: boolean } = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export interface AvatarBlobatarProps {
  /** Entity id, never a name - docs/03 section 13 "Seeds": renaming a person must not change their face. */
  seed: string
  palette: BlobatarPalette
  size: 24 | 32 | 40 | 64
  /** "" when the name is already written beside it (decorative); the person's name where this avatar stands alone. */
  alt: string
  /**
   * Opt-in only, per call site - docs/03 section 13 "Motion": animating switches rendering to
   * inline SVG at roughly a dozen DOM nodes, which a 148-row table cannot afford. Omit for the
   * static <img> form everywhere else.
   */
  animate?: "hover"
  /** Shown on generation failure, or (static only) an actual image load failure - docs/03 section 13 "Fallback": a slot is never empty. */
  fallbackInitials: string
  /** e.g. "bg-purple-xsoft" - the accent's soft token, per docs/03 section 13 "Fallback". */
  fallbackClassName?: string
}

// The one component every blobatar in the app renders through (docs/03 section 13, ADR-021).
function AvatarBlobatar({
  seed,
  palette,
  size,
  alt,
  animate,
  fallbackInitials,
  fallbackClassName,
}: AvatarBlobatarProps) {
  const fallback = (
    <AvatarFallback className={cn("text-ink", fallbackClassName)}>{fallbackInitials}</AvatarFallback>
  )

  if (animate) {
    return (
      <Avatar style={{ width: size, height: size }}>
        <BlobatarErrorBoundary fallback={fallback}>
          <BlobatarSvg
            name={seed}
            animate="hover"
            size={size}
            background="circle"
            palette={palette}
            title={alt || undefined}
            role={alt ? "img" : undefined}
            aria-hidden={alt ? undefined : true}
            className="size-full rounded-pill"
          />
        </BlobatarErrorBoundary>
      </Avatar>
    )
  }

  // blobatarUri() is deterministic and should not throw for a well-formed seed; the try/catch
  // exists specifically for docs/03 section 13 "Fallback" ("if the module fails to load").
  let src: string | null
  try {
    src = blobatarUri(seed, { size, background: "circle", palette })
  } catch {
    src = null
  }

  return (
    <Avatar style={{ width: size, height: size }}>
      {src ? <AvatarImage src={src} alt={alt} /> : null}
      {fallback}
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBlobatar }
