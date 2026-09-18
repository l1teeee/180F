import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDemoRuntimeStore } from "@/stores/demo-runtime.store"

// Local stand-in for the shared ErrorState named in master plan section 51/48 - src/components/
// shared is owned by another agent right now, so this is built here and flagged for hoisting.
// docs/08-STATE-MANAGEMENT.md section 8.4: "Views render ErrorState with a Try again button
// when status === 'error'; the button calls hydrateDemo() again."
export function BookingErrorState() {
  const error = useDemoRuntimeStore((state) => state.error)

  return (
    <Card role="alert" className="animate-fade-up items-center gap-4 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-chip bg-danger-soft text-danger-deep">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[15px] font-semibold text-ink">Something went wrong</p>
        <p className="text-sm text-text-secondary">{error ?? "We couldn't load class availability."}</p>
      </div>
      <Button type="button" onClick={() => void useDemoRuntimeStore.getState().retryHydration()}>
        Try again
      </Button>
    </Card>
  )
}
