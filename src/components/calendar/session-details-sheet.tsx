'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.3 + docs/03-DESIGN-SYSTEM.md section 11.4-C "Side
// sheet". Mirrors the visual pattern already proven in
// src/app/design-system/_components/overlays/session-details-sheet.tsx, but reads the real
// session through useSessionCard (existing hook, untouched) instead of hard-coded example props.
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { useSessionCard } from '@/hooks/use-session-card';
import { formatDisplayDate, formatDisplayTime } from '@/lib/dates';

export interface SessionDetailsSheetProps {
  sessionId: string | null;
  onOpenChange: (open: boolean) => void;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{label}</span>
      <p className="text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}

export function SessionDetailsSheet({ sessionId, onOpenChange }: SessionDetailsSheetProps) {
  const card = useSessionCard(sessionId ?? '');
  const open = sessionId != null && card != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        {card ? (
          <>
            <SheetHeader>
              <SheetTitle>Session details</SheetTitle>
              <SheetDescription>
                {card.classType.name} &middot; {formatDisplayDate(card.date)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Date" value={formatDisplayDate(card.date)} />
                <InfoField
                  label="Time"
                  value={`${formatDisplayTime(card.startTime)} - ${formatDisplayTime(card.endTime)}`}
                />
                <InfoField label="Instructor" value={card.instructor.name} />
                <InfoField label="Room" value={card.room} />
              </div>

              <div className="flex flex-col gap-2.5 rounded-card-sm border border-border-soft bg-canvas-wash p-3.5">
                <div className="flex items-center gap-3">
                  <OccupancyBar rate={card.occupancyRate} accent={card.classType.accent} showPercentage={false} />
                  <span className="shrink-0 text-sm font-semibold text-ink tabular-nums">
                    {card.booked} / {card.capacity} spots reserved
                  </span>
                </div>
                {card.occupancyState !== 'available' ? (
                  <div>
                    <StatusBadge status={card.occupancyState} />
                  </div>
                ) : null}
                {/* occupancyRate is clamped to 1 for display - overbooked is the truth the clamp
                    would otherwise hide (task brief: "must read overbooked and say so explicitly
                    rather than hiding it behind the clamp"). */}
                {card.overbooked ? (
                  <p className="text-xs font-medium text-danger-text">
                    Overbooked by {card.booked - card.capacity}: capacity was reduced below the current booking
                    count.
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-field border border-border px-3.5 py-3">
                <span className="text-sm font-medium text-text-secondary">On waitlist</span>
                <span className="text-sm font-semibold text-ink tabular-nums">{card.waitlistCount}</span>
              </div>
            </div>

            <SheetFooter className="flex-row justify-end gap-3">
              <Button variant="secondary" asChild>
                <Link href="/bookings">View bookings</Link>
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => toast.info("Editing a class isn't available in this demo.")}
              >
                Edit class
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
