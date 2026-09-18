import { cn } from "@/lib/cn"

// docs/03 section 12.2 pattern 5 "Shimmer" - the only looping animation besides the simulated
// send spinner. animate-shimmer is the globals.css utility (a muted fill plus a moving
// highlight band); skeletons never use a bespoke pulse/opacity animation.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-shimmer rounded-field", className)}
      {...props}
    />
  )
}

export { Skeleton }
