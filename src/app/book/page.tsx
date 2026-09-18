import { Suspense } from "react"
import type { Metadata } from "next"

import { PublicBookingWizard } from "@/components/booking/public-booking-wizard"
import { WizardFallback } from "@/components/booking/wizard-fallback"

export const metadata: Metadata = {
  title: "Book a class - 180 Fitness Studio",
  description: "Reserve your spot at 180 Fitness Studio in under a minute.",
}

// Wrapped in Suspense because PublicBookingWizard reads useSearchParams (the `?step=` wizard
// position) - required for the App Router build, effectively instant here since this route has
// no server data fetch to wait on (ADR-004: client-first, no server data fetching).
export default function BookPage() {
  return (
    <Suspense fallback={<WizardFallback />}>
      <PublicBookingWizard initialClassId={null} />
    </Suspense>
  )
}
