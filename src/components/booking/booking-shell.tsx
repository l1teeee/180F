import type { ReactNode } from "react"
import Image from "next/image"

// docs/06-ROUTES-AND-SCREENS.md section 3.14 "Shell": no AppSidebar/TopBar, mobile-first, a
// centered column at wider viewports against a branded background - desktop is a constrained
// view of the mobile-first design, not a separate layout. `bg-dotfield` is globals.css's own
// utility for docs/03-DESIGN-SYSTEM.md section 2's dot-field pattern ("behind empty states and
// the public booking hero only") - reused as-is, not reimplemented, since that file is
// read-only to this agent.
export function BookingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-canvas-wash">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dotfield" />
      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-center gap-2 py-6">
          {/* Client-supplied mark (public/brand/mark.png) - studio name stays live text
              per ADR-019, so only the monogram is baked into an image. */}
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-ink">
            <Image src="/brand/mark.png" alt="" width={437} height={256} className="w-[22px] h-auto" />
          </span>
          <span className="text-sm font-bold tracking-tight text-ink">180 Fitness Studio</span>
        </header>
        <main className="flex flex-1 flex-col px-4 pb-10 min-[768px]:px-6 min-[1024px]:px-0">
          <div className="mx-auto w-full max-w-full min-[1024px]:max-w-[560px] min-[1440px]:max-w-[480px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
