'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/classes/". docs/06 section 3.7 /
// master plan section 27: icon, name, description, weekly sessions, average occupancy, assigned
// instructors, consistent class-category accent. Motion pattern 1 "Hover lift" (docs/03 12.2) -
// the whole card is the click target, a native <a> via next/link, so it is keyboard-operable and
// picks up the global focus ring (docs/03 12.6) with no extra work.
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { ACCENT_ICON_BG_CLASS, ClassIcon } from '@/components/shared/class-icon';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import type { AccentToken, ClassTypeWithStats, Instructor } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';

export interface ClassCardProps {
  classType: ClassTypeWithStats;
  instructors: Instructor[];
  index?: number; // stagger position, capped at 6 (docs/03 12.3.5) - ClassGrid passes index % 6
}

// Solid accent -> top bar class, so each card reads as its own category rather than an identical
// white rectangle repeated eight times (docs/03 section 5 "Category tile" is the reference line
// for this catalog, even though this card keeps the white-surface content docs/06 section 3.7
// specifies). Duplicated from occupancy-bar.tsx's own accent map rather than imported: that file
// lives in components/shared/, outside this task's write set.
const ACCENT_TOP_BAR_CLASS: Record<AccentToken, string> = {
  purple: 'bg-purple',
  yellow: 'bg-yellow',
  green: 'bg-green',
  pink: 'bg-pink',
  blue: 'bg-blue',
};

export function ClassCard({ classType, instructors, index = 0 }: ClassCardProps) {
  const m = useMessages();
  return (
    <Link
      href={`/classes/${classType.id}`}
      style={{ '--stagger-index': index } as CSSProperties}
      className="animate-fade-up group relative flex flex-col gap-4 overflow-hidden rounded-card border border-border bg-surface p-6 pt-5 shadow-card transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-out hover:-translate-y-0.5 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 rounded-t-card ${ACCENT_TOP_BAR_CLASS[classType.accent]}`}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={`flex size-11 shrink-0 items-center justify-center rounded-chip ${ACCENT_ICON_BG_CLASS[classType.accent]}`}
        >
          <ClassIcon name={classType.icon} className="size-5" />
        </span>
        <span className="text-xs font-semibold text-text-secondary">{classType.durationMinutes} min</span>
      </div>

      <div className="flex flex-col gap-1">
        {/* h2, not h3: the page header's h1 has no intervening h2 before this grid, so h3 here
            would skip a level (docs/03 section 10 / the polish brief's heading-order rule). */}
        <h2 className="text-[17px] font-semibold text-ink">{classType.name}</h2>
        <p className="line-clamp-2 text-sm text-text-secondary">{classType.description}</p>
      </div>

      <div className="flex items-baseline gap-1.5 text-sm">
        <span className="text-lg font-bold tabular-nums text-ink">{classType.weeklySessions}</span>
        <span className="font-medium text-text-secondary">{m.classes.sessionsPerWeekUnit(classType.weeklySessions)}</span>
      </div>

      {/* Stacked label instead of OccupancyBar's own inline `label` prop: that prop reserves a
          fixed 112px column ahead of the flex-1 track, which a tight 3-column card (lg breakpoint,
          around 1024px) doesn't have room for alongside the description and instructor row - the
          non-shrinking label, gaps and percentage outweigh the space left for the track, so it
          collapses to 0 width and the bar disappears entirely. Stacking the label above leaves the
          track the full card width at every breakpoint. */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{m.classes.card.avgOccupancy}</span>
        <OccupancyBar rate={classType.averageOccupancy} accent={classType.accent} />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs font-semibold text-text-secondary">{m.classes.card.instructorsLabel}</span>
        {instructors.length > 0 ? (
          <AvatarGroup
            people={instructors.map((instructor) => ({
              id: instructor.id,
              name: instructor.name,
              avatar: instructor.avatar,
              accent: classType.accent,
            }))}
            size={24}
            max={3}
          />
        ) : (
          <span className="text-xs text-text-secondary">{m.classes.card.unassigned}</span>
        )}
      </div>
    </Link>
  );
}
