import { Skeleton } from "@/components/ui/skeleton"

// Suspense fallback for both /book and /book/[classId] (each page.tsx wraps
// <PublicBookingWizard> in <Suspense> because it reads useSearchParams). Renders inside
// src/app/book/layout.tsx's <BookingShell>, so this only supplies the inner content skeleton.
// In practice this is client-only and resolves within a frame, but Next still requires the
// Suspense boundary.
export function WizardFallback() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-7 w-48" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
      </div>
    </div>
  )
}
