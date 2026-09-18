import { Suspense } from "react"
import type { Metadata } from "next"

import { PublicBookingWizard } from "@/components/booking/public-booking-wizard"
import { WizardFallback } from "@/components/booking/wizard-fallback"

export const metadata: Metadata = {
  title: "Book a class - 180 Fitness Studio",
  description: "Reserve your spot at 180 Fitness Studio in under a minute.",
}

// docs/06-ROUTES-AND-SCREENS.md section 3.14: pre-sets step 1's selection to `classId`. An id
// that doesn't resolve to one of the curated public class types falls back to step 1
// unselected inside the wizard hook - this route never calls notFound() (the public flow must
// never dead-end).
export default async function BookClassPage(props: PageProps<"/book/[classId]">) {
  const { classId } = await props.params

  return (
    <Suspense fallback={<WizardFallback />}>
      <PublicBookingWizard initialClassId={classId} />
    </Suspense>
  )
}
